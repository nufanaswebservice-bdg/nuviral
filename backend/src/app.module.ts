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
      // Don't specify envFilePath in production (Railway injects env vars directly)
      // In local dev, .env is loaded from the root automatically
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '../.env',
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

    // Queue System - supports both REDIS_URL (Railway) and separate host/port
    BullModule.forRoot({
      connection: process.env.REDIS_URL
        ? {
            // Railway provides REDIS_URL as a full URL (supports TLS with rediss://)
            url: process.env.REDIS_URL,
          }
        : {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
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
