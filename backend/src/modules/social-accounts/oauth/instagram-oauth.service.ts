import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class InstagramOAuthService {
  private appId: string;
  private appSecret: string;
  private redirectUri: string;

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get('INSTAGRAM_APP_ID') || '';
    this.appSecret = this.configService.get('INSTAGRAM_APP_SECRET') || '';
    this.redirectUri = `${this.configService.get('API_URL')}/social-accounts/instagram/callback`;
  }

  getAuthUrl(): string {
    const scopes = 'instagram_basic,instagram_content_publish,pages_read_engagement,pages_show_list';

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes,
    });

    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCode(code: string) {
    // Exchange code for short-lived token
    const tokenResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: this.appId,
        client_secret: this.appSecret,
        redirect_uri: this.redirectUri,
        code,
      },
    });

    const shortLivedToken = tokenResponse.data.access_token;

    // Exchange for long-lived token (60 days)
    const longLivedResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: shortLivedToken,
      },
    });

    const accessToken = longLivedResponse.data.access_token;
    const expiresIn = longLivedResponse.data.expires_in;

    // Get Instagram Business Account ID
    const pagesResponse = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: { access_token: accessToken, fields: 'instagram_business_account,name' },
    });

    const page = pagesResponse.data.data?.[0];
    const igAccountId = page?.instagram_business_account?.id;

    // Get Instagram user info
    let username = 'instagram_user';
    let displayName = 'Instagram User';
    let avatar = '';

    if (igAccountId) {
      const igResponse = await axios.get(`https://graph.facebook.com/v19.0/${igAccountId}`, {
        params: { fields: 'username,name,profile_picture_url', access_token: accessToken },
      });
      username = `@${igResponse.data.username}`;
      displayName = igResponse.data.name || igResponse.data.username;
      avatar = igResponse.data.profile_picture_url || '';
    }

    return {
      accessToken,
      refreshToken: null, // Facebook long-lived tokens don't have refresh tokens
      expiresIn,
      platformUserId: igAccountId,
      username,
      displayName,
      avatar,
    };
  }
}
