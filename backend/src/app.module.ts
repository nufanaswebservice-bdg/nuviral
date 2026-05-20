import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AiModule } from './modules/ai/ai.module';
import { VideosModule } from './modules/videos/videos.module';
import { UploadModule } from './modules/upload/upload.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { SocialAccountsModule } from './modules/social-accounts/social-accounts.module';
import { AdminModule } from './modules/admin/admin.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { TrendsModule } from './modules/trends/trends.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Task Scheduling
    ScheduleModule.forRoot(),

    // Queue System
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    // Database
    PrismaModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    AiModule,
    VideosModule,
    UploadModule,
    AnalyticsModule,
    SchedulesModule,
    TemplatesModule,
    MediaModule,
    NotificationsModule,
    SubscriptionModule,
    SocialAccountsModule,
    AdminModule,
    WorkflowModule,
    TrendsModule,
  ],
})
export class AppModule {}
