import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FacebookOAuthService {
  private appId: string;
  private appSecret: string;
  private redirectUri: string;

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get('FACEBOOK_APP_ID') || '';
    this.appSecret = this.configService.get('FACEBOOK_APP_SECRET') || '';
    this.redirectUri = `${this.configService.get('API_URL')}/social-accounts/facebook/callback`;
  }

  getAuthUrl(): string {
    const scopes = 'pages_manage_posts,pages_read_engagement,publish_video,pages_show_list';

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes,
    });

    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCode(code: string) {
    // Exchange code for token
    const tokenResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: this.appId,
        client_secret: this.appSecret,
        redirect_uri: this.redirectUri,
        code,
      },
    });

    const shortLivedToken = tokenResponse.data.access_token;

    // Exchange for long-lived token
    const longLivedResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: shortLivedToken,
      },
    });

    const userAccessToken = longLivedResponse.data.access_token;

    // Get Pages and their access tokens
    const pagesResponse = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: { access_token: userAccessToken, fields: 'id,name,access_token,picture' },
    });

    const page = pagesResponse.data.data?.[0];

    if (!page) {
      throw new Error('No Facebook Page found. Please create a Facebook Page first.');
    }

    return {
      accessToken: page.access_token, // Page access token (never expires)
      refreshToken: null,
      expiresIn: null, // Page tokens don't expire
      platformUserId: page.id,
      username: page.name,
      displayName: page.name,
      avatar: page.picture?.data?.url || '',
      pageId: page.id,
    };
  }
}
