import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { SUBSCRIPTION_PLANS } from '@viralai/shared';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
  }

  async getCurrentPlan(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  async createCheckoutSession(userId: string, plan: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const priceId = this.getPriceId(plan);
    if (!priceId) throw new BadRequestException('Invalid plan');

    let customerId = (await this.prisma.subscription.findUnique({ where: { userId } }))?.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId },
      });
      customerId = customer.id;
      await this.prisma.subscription.update({
        where: { userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${this.configService.get('APP_URL')}/dashboard/billing?success=true`,
      cancel_url: `${this.configService.get('APP_URL')}/dashboard/billing?cancelled=true`,
      metadata: { userId, plan },
    });

    return { url: session.url };
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.activateSubscription(session);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handlePaymentFailed(invoice);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.cancelSubscription(subscription);
        break;
      }
    }
  }

  private async activateSubscription(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as keyof typeof SUBSCRIPTION_PLANS;
    if (!userId || !plan) return;

    const planConfig = SUBSCRIPTION_PLANS[plan];

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: plan as any,
        status: 'ACTIVE',
        stripeSubscriptionId: session.subscription as string,
        videoRenderLimit: planConfig.videoRenderLimit,
        aiCreditsLimit: planConfig.aiCreditsLimit,
        storageLimit: BigInt(planConfig.storageLimit),
        teamMemberLimit: planConfig.teamMemberLimit,
        apiAccessEnabled: planConfig.apiAccess,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'PAST_DUE' },
      });
    }
  }

  private async cancelSubscription(stripeSubscription: Stripe.Subscription) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });
    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELLED', plan: 'FREE' },
      });
    }
  }

  private getPriceId(plan: string): string | null {
    const priceMap: Record<string, string> = {
      STARTER: this.configService.get('STRIPE_PRICE_STARTER') || '',
      PRO: this.configService.get('STRIPE_PRICE_PRO') || '',
      AGENCY: this.configService.get('STRIPE_PRICE_AGENCY') || '',
    };
    return priceMap[plan] || null;
  }
}
