import { Controller, Get, Post, Body, UseGuards, Req, RawBodyRequest, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  private stripe: Stripe;

  constructor(
    private subscriptionService: SubscriptionService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
  }

  @Get('current')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current subscription' })
  async getCurrentPlan(@Req() req: any) {
    return this.subscriptionService.getCurrentPlan(req.user.id);
  }

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create checkout session' })
  async createCheckout(@Req() req: any, @Body() body: { plan: string }) {
    return this.subscriptionService.createCheckoutSession(req.user.id, body.plan);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody as Buffer,
      signature,
      webhookSecret || '',
    );
    await this.subscriptionService.handleWebhook(event);
    return { received: true };
  }
}
