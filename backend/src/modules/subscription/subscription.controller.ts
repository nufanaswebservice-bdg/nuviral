import { Controller, Get, Post, Body, UseGuards, Req, Query, UsePipes, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current subscription plan' })
  async getCurrentPlan(@Req() req: any) {
    return this.subscriptionService.getCurrentPlan(req.user.id);
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
