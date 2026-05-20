import { Module } from '@nestjs/common';
import { SocialAccountsController } from './social-accounts.controller';
import { SocialAccountsService } from './social-accounts.service';
import { YouTubeOAuthService } from './oauth/youtube-oauth.service';
import { TikTokOAuthService } from './oauth/tiktok-oauth.service';
import { InstagramOAuthService } from './oauth/instagram-oauth.service';
import { FacebookOAuthService } from './oauth/facebook-oauth.service';

@Module({
  controllers: [SocialAccountsController],
  providers: [
    SocialAccountsService,
    YouTubeOAuthService,
    TikTokOAuthService,
    InstagramOAuthService,
    FacebookOAuthService,
  ],
  exports: [SocialAccountsService],
})
export class SocialAccountsModule {}
