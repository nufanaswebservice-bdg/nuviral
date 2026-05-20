import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TikTokOAuthService {
  private clientKey: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(private configService: ConfigService) {
    this.clientKey = this.configService.get('TIKTOK_CLIENT_KEY') || '';
    this.clientSecret = this.configService.get('TIKTOK_CLIENT_SECRET') || '';
    this.redirectUri = `${this.configService.get('API_URL')}/social-accounts/tiktok/callback`;
  }

  getAuthUrl(): string {
    const scopes = 'user.info.basic,video.publish,video.upload';

    const params = new URLSearchParams({
      client_key: this.clientKey,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes,
    });

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  async exchangeCode(code: string) {
    const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: this.clientKey,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, refresh_token, expires_in, open_id } = response.data;

    // Get user info
    const userInfo = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      params: { fields: 'open_id,union_id,avatar_url,display_name,username' },
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = userInfo.data.data?.user;

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      platformUserId: open_id,
      username: user?.username ? `@${user.username}` : `@user_${open_id.slice(0, 8)}`,
      displayName: user?.display_name || 'TikTok User',
      avatar: user?.avatar_url,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: this.clientKey,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  }
}
