import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { MidtransService } from './midtrans.service';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, MidtransService],
  exports: [SubscriptionService, MidtransService],
})
export class SubscriptionModule {}
