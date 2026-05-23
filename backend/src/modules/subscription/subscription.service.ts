import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MidtransService } from './midtrans.service';
import { v4 as uuidv4 } from 'uuid';

// Define plans directly to avoid @viralai/shared import issues in production
const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    videoRenderLimit: 5,
    aiCreditsLimit: 50,
    storageLimit: 1 * 1024 * 1024 * 1024,
    teamMemberLimit: 1,
    apiAccess: false,
  },
  STARTER: {
    name: 'Starter',
    price: 449000,
    videoRenderLimit: 50,
    aiCreditsLimit: 500,
    storageLimit: 10 * 1024 * 1024 * 1024,
    teamMemberLimit: 2,
    apiAccess: false,
  },
  PRO: {
    name: 'Pro',
    price: 1225000,
    videoRenderLimit: 200,
    aiCreditsLimit: 2000,
    storageLimit: 50 * 1024 * 1024 * 1024,
    teamMemberLimit: 5,
    apiAccess: true,
  },
  AGENCY: {
    name: 'Agency',
    price: 3085000,
    videoRenderLimit: 1000,
    aiCreditsLimit: 10000,
    storageLimit: 200 * 1024 * 1024 * 1024,
    teamMemberLimit: 20,
    apiAccess: true,
  },
} as const;

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private midtransService: MidtransService,
  ) {}

  async getCurrentPlan(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  async createTransaction(userId: string, plan: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const planKey = plan.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS;
    const planConfig = SUBSCRIPTION_PLANS[planKey];
    if (!planConfig || planKey === 'FREE') {
      throw new BadRequestException('Invalid plan');
    }

    // Validate Midtrans keys are configured
    const serverKey = this.configService.get('MIDTRANS_SERVER_KEY');
    if (!serverKey) {
      this.logger.error('MIDTRANS_SERVER_KEY is not configured');
      throw new InternalServerErrorException('Payment system is not configured');
    }

    // Harga dalam Rupiah langsung dari plan config
    const amountInIdr = planConfig.price;

    const orderId = `NUVIRAL-${String(planKey)}-${userId.slice(0, 8)}-${Date.now()}`;

    try {
      // Save pending transaction
      await this.prisma.subscription.upsert({
        where: { userId },
        update: {
          pendingPlan: String(planKey),
          pendingOrderId: orderId,
        },
        create: {
          userId,
          plan: 'FREE' as any,
          status: 'ACTIVE' as any,
          pendingPlan: String(planKey),
          pendingOrderId: orderId,
          videoRenderLimit: SUBSCRIPTION_PLANS.FREE.videoRenderLimit,
          aiCreditsLimit: SUBSCRIPTION_PLANS.FREE.aiCreditsLimit,
          storageLimit: BigInt(SUBSCRIPTION_PLANS.FREE.storageLimit),
          teamMemberLimit: SUBSCRIPTION_PLANS.FREE.teamMemberLimit,
          apiAccessEnabled: SUBSCRIPTION_PLANS.FREE.apiAccess,
        },
      });
    } catch (dbError: any) {
      this.logger.error(`Database error: ${dbError.message}`);
      throw new InternalServerErrorException('Failed to save transaction to database');
    }

    try {
      const transaction = await this.midtransService.createTransaction({
        orderId,
        amount: amountInIdr,
        customerName: user.name || 'Customer',
        customerEmail: user.email,
        planName: planConfig.name,
      });

      return {
        token: transaction.token,
        redirectUrl: transaction.redirectUrl,
        orderId,
      };
    } catch (midtransError: any) {
      this.logger.error(`Midtrans error: ${midtransError.message}`, midtransError.stack);
      throw new InternalServerErrorException(
        `Failed to create payment transaction: ${midtransError.message}`,
      );
    }
  }

  async handleNotification(notification: any) {
    this.logger.log(`Received Midtrans notification: ${JSON.stringify(notification)}`);

    // Handle test notification from Midtrans dashboard
    if (!notification.order_id || !notification.transaction_status) {
      this.logger.log('Test notification received from Midtrans dashboard');
      return { status: 'ok', message: 'test notification received' };
    }

    // Verify signature
    const isValid = this.midtransService.verifyNotificationSignature(notification);
    if (!isValid) {
      this.logger.warn(`Invalid notification signature for order: ${notification.order_id}`);
      throw new BadRequestException('Invalid signature');
    }

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    this.logger.log(
      `Payment notification received - Order: ${orderId}, Status: ${transactionStatus}, Fraud: ${fraudStatus}`,
    );

    // Find subscription by pending order ID
    const subscription = await this.prisma.subscription.findFirst({
      where: { pendingOrderId: orderId },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found for order: ${orderId}`);
      return { status: 'ignored' };
    }

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        await this.activateSubscription(subscription.userId, subscription.pendingPlan!);

        // Save payment history
        await this.prisma.paymentHistory.create({
          data: {
            userId: subscription.userId,
            orderId,
            plan: subscription.pendingPlan!,
            amount: parseFloat(notification.gross_amount),
            currency: 'IDR',
            status: 'SUCCESS',
            paymentType: notification.payment_type,
            transactionId: notification.transaction_id,
            paidAt: new Date(),
            metadata: notification,
          },
        });
      }
    } else if (transactionStatus === 'pending') {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'PENDING' },
      });

      // Save pending payment history
      await this.prisma.paymentHistory.upsert({
        where: { orderId },
        update: { status: 'PENDING', paymentType: notification.payment_type },
        create: {
          userId: subscription.userId,
          orderId,
          plan: subscription.pendingPlan!,
          amount: parseFloat(notification.gross_amount),
          currency: 'IDR',
          status: 'PENDING',
          paymentType: notification.payment_type,
          transactionId: notification.transaction_id,
          metadata: notification,
        },
      });
    } else if (
      transactionStatus === 'deny' ||
      transactionStatus === 'cancel' ||
      transactionStatus === 'expire'
    ) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          pendingPlan: null,
          pendingOrderId: null,
        },
      });

      // Update payment history
      await this.prisma.paymentHistory.upsert({
        where: { orderId },
        update: {
          status: transactionStatus === 'expire' ? 'EXPIRED' : 'FAILED',
        },
        create: {
          userId: subscription.userId,
          orderId,
          plan: subscription.pendingPlan || 'UNKNOWN',
          amount: parseFloat(notification.gross_amount || '0'),
          currency: 'IDR',
          status: transactionStatus === 'expire' ? 'EXPIRED' : 'FAILED',
          paymentType: notification.payment_type,
          transactionId: notification.transaction_id,
          metadata: notification,
        },
      });
    }

    return { status: 'ok' };
  }

  async checkTransactionStatus(userId: string, orderId: string) {
    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!subscription || subscription.pendingOrderId !== orderId) {
      throw new BadRequestException('Order not found');
    }

    const status = await this.midtransService.getTransactionStatus(orderId);
    return {
      orderId,
      transactionStatus: status.transaction_status,
      paymentType: status.payment_type,
    };
  }

  private async activateSubscription(userId: string, plan: string) {
    const planKey = plan as keyof typeof SUBSCRIPTION_PLANS;
    const planConfig = SUBSCRIPTION_PLANS[planKey];

    if (!planConfig) {
      this.logger.error(`Invalid plan key: ${plan}`);
      return;
    }

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: String(planKey),
        status: 'ACTIVE',
        pendingPlan: null,
        pendingOrderId: null,
        videoRenderLimit: planConfig.videoRenderLimit,
        aiCreditsLimit: planConfig.aiCreditsLimit,
        storageLimit: BigInt(planConfig.storageLimit),
        teamMemberLimit: planConfig.teamMemberLimit,
        apiAccessEnabled: planConfig.apiAccess,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    this.logger.log(`Subscription activated for user ${userId} - Plan: ${String(planKey)}`);
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!subscription) throw new BadRequestException('Subscription not found');

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: 'FREE',
        status: 'ACTIVE',
        videoRenderLimit: SUBSCRIPTION_PLANS.FREE.videoRenderLimit,
        aiCreditsLimit: SUBSCRIPTION_PLANS.FREE.aiCreditsLimit,
        storageLimit: BigInt(SUBSCRIPTION_PLANS.FREE.storageLimit),
        teamMemberLimit: SUBSCRIPTION_PLANS.FREE.teamMemberLimit,
        apiAccessEnabled: SUBSCRIPTION_PLANS.FREE.apiAccess,
      },
    });

    return { message: 'Subscription cancelled, reverted to Free plan' };
  }

  async getPaymentHistory(userId: string) {
    return this.prisma.paymentHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
