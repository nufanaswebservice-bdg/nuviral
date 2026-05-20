import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialAccountsService } from './social-accounts.service';
import { YouTubeOAuthService } from './oauth/youtube-oauth.service';
import { TikTokOAuthService } from './oauth/tiktok-oauth.service';
import { InstagramOAuthService } from './oauth/instagram-oauth.service';
import { FacebookOAuthService } from './oauth/facebook-oauth.service';

@ApiTags('Social Accounts')
@Controller('social-accounts')
export class SocialAccountsController {
  constructor(
    private socialAccountsService: SocialAccountsService,
    private youtubeOAuth: YouTubeOAuthService,
    private tiktokOAuth: TikTokOAuthService,
    private instagramOAuth: InstagramOAuthService,
    private facebookOAuth: FacebookOAuthService,
    private configService: ConfigService,
  ) {}

  // ==========================================
  // OAuth Connect Routes
  // ==========================================

  @Get('youtube/connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Start YouTube OAuth flow' })
  async connectYouTube(@Res() res: Response) {
    const url = this.youtubeOAuth.getAuthUrl();
    res.redirect(url);
  }

  @Get('youtube/callback')
  @ApiOperation({ summary: 'YouTube OAuth callback' })
  async youtubeCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const data = await this.youtubeOAuth.exchangeCode(code);
      // In production: get userId from state parameter or session
      // For now, redirect to frontend with token
      const frontendUrl = this.configService.get('APP_URL');
      res.redirect(`${frontendUrl}/dashboard/accounts?platform=youtube&status=success`);
    } catch (error: any) {
      const frontendUrl = this.configService.get('APP_URL');
      res.redirect(`${frontendUrl}/dashboard/accounts?platform=youtube&status=error&message=${error.message}`);
    }
  }

  @Get('tiktok/connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Start TikTok OAuth flow' })
  async connectTikTok(@Res() res: Response) {
    const url = this.tiktokOAuth.getAuthUrl();
    res.redirect(url);
  }

  @Get('tiktok/callback')
  @ApiOperation({ summary: 'TikTok OAuth callback' })
  async tiktokCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const data = await this.tiktokOAuth.exchangeCode(code);
      const frontendUrl = this.configService.get('APP_URL');
      res.redirect(`${frontendUrl}/dashboard/accounts?platform=tiktok&status=success`);
    } catch (error: any) {
      const frontendUrl = this.configService.get('APP_URL');
      res.redirect(`${frontendUrl}/dashboard/accounts?platform=tiktok&status=error&message=${error.message}`);
    }
  }

  @Get('instagram/connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Start Instagram OAuth flow' })
  async connectInstagram(@Res() res: Response) {
    const url = this.instagramOAuth.getAuthUrl();
    res.redirect(url);
  }

  @Get('instagram/callback')
  @ApiOperation({ summary: 'Instagram OAuth callback' })
  async instagramCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const data = await this.instagramOAuth.exchangeCode(code);
      const frontendUrl = this.configService.get('APP_URL');
      res.redirect(`${frontendUrl}/dashboard/accounts?platform=instagram&status=success`);
    } catch (error: any) {
      const frontendUrl = this.configService.get('APP_URL');
      res.redirect(`${frontendUrl}/dashboard/accounts?platform=instagram&status=error&message=${error.message}`);
    }
  }

  @Get('facebook/connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Start Facebook OAuth flow' })
  async connectFacebook(@Res() res: Response) {
    const url = this.facebookOAuth.getAuthUrl();
    res.redirect(url);
  }

  @Get('facebook/callback')
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  async facebookCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const data = await this.facebookOAuth.exchangeCode(code);
      const frontendUrl = this.configService.get('APP_URL');
      res.redirect(`${frontendUrl}/dashboard/accounts?platform=facebook&status=success`);
    } catch (error: any) {
      const frontendUrl = this.configService.get('APP_URL');
      res.redirect(`${frontendUrl}/dashboard/accounts?platform=facebook&status=error&message=${error.message}`);
    }
  }

  // ==========================================
  // Account Management Routes
  // ==========================================

  @Post('connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Connect social account (manual)' })
  async connect(@Req() req: any, @Body() body: {
    platform: string;
    platformUserId?: string;
    username?: string;
    displayName?: string;
    accessToken?: string;
    refreshToken?: string;
  }) {
    return this.socialAccountsService.connect(req.user.id, body);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get connected accounts' })
  async getAccounts(@Req() req: any) {
    return this.socialAccountsService.getUserAccounts(req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Disconnect account' })
  async disconnect(@Param('id') id: string) {
    return this.socialAccountsService.disconnect(id);
  }

  @Post(':id/refresh')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Refresh account token' })
  async refreshToken(@Param('id') id: string) {
    return this.socialAccountsService.refreshTokens(id);
  }
}
