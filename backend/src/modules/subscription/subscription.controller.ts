import { Controller, Get, Post, Body, UseGuards, Req, Query, UsePipes, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import { SubscriptionService } from './subscription.service';

const ADMIN_EMAILS = [
  'nufanaswebservice@gmail.com',
  'baranashira01@gmail.com',
  'rufanaswebservice@gmail.com',
  'owner@nuviral.cloud',
];

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for subscription service' })
  async healthCheck() {
    return {
      status: 'ok',
      service: 'subscription',
      timestamp: new Date().toISOString(),
      midtransConfigured: !!process.env.MIDTRANS_SERVER_KEY,
    };
  }

  @Get('current')
  @ApiBearerAuth()
  @UseGuards(FlexibleAuthGuard)
  @ApiOperation({ summary: 'Get current subscription plan' })
  async getCurrentPlan(@Req() req: any) {
    const email = req.userEmail;

    if (ADMIN_EMAILS.includes(email)) {
      return {
        plan: 'AGENCY',
        status: 'ACTIVE',
        videoRenderLimit: 9999,
        videoRenderUsed: 0,
        aiCreditsLimit: 99999,
        aiCreditsUsed: 0,
        storageLimit: 214748364800,
        storageUsed: 0,
        teamMemberLimit: 100,
        apiAccessEnabled: true,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    return {
      plan: 'FREE',
      status: 'ACTIVE',
      videoRenderLimit: 5,
      videoRenderUsed: 0,
      aiCreditsLimit: 50,
      aiCreditsUsed: 0,
      storageLimit: 1073741824,
      storageUsed: 0,
      teamMemberLimit: 1,
      apiAccessEnabled: false,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  @Post('create-transaction')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create Midtrans payment transaction' })
  async createTransaction(@Req() req: any, @Body() body: { plan: string }) {
    return this.subscriptionService.createTransaction(req.user.id, body.plan);
  }

  @Post('notification')
  @SkipThrottle()
  @HttpCode(200)
  @ApiOperation({ summary: 'Midtrans payment notification webhook' })
  async handleNotification(@Body() notification: Record<string, any>) {
    return this.subscriptionService.handleNotification(notification);
  }

  @Get('status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check transaction status' })
  async checkStatus(@Req() req: any, @Query('orderId') orderId: string) {
    return this.subscriptionService.checkTransactionStatus(req.user.id, orderId);
  }

  @Post('cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancelSubscription(@Req() req: any) {
    return this.subscriptionService.cancelSubscription(req.user.id);
  }

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment history' })
  async getPaymentHistory(@Req() req: any) {
    return this.subscriptionService.getPaymentHistory(req.user.id);
  }
}
