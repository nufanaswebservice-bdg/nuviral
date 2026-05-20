import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class YouTubeOAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get('YOUTUBE_CLIENT_ID') || '';
    this.clientSecret = this.configService.get('YOUTUBE_CLIENT_SECRET') || '';
    this.redirectUri = `${this.configService.get('API_URL')}/social-accounts/youtube/callback`;
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCode(code: string) {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
    });

    const { access_token, refresh_token, expires_in } = response.data;

    // Get user info
    const userInfo = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: { part: 'snippet', mine: true },
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const channel = userInfo.data.items?.[0];

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      platformUserId: channel?.id,
      username: channel?.snippet?.customUrl || channel?.snippet?.title,
      displayName: channel?.snippet?.title,
      avatar: channel?.snippet?.thumbnails?.default?.url,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
    };
  }
}
