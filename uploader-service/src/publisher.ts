import { TikTokUploader } from './platforms/tiktok';
import { YouTubeUploader } from './platforms/youtube';
import { InstagramUploader } from './platforms/instagram';
import { FacebookUploader } from './platforms/facebook';

export interface PublishConfig {
  videoPath: string;
  title: string;
  description?: string;
  caption?: string;
  hashtags?: string[];
  platform: string;
  accessToken: string;
  refreshToken?: string;
}

export interface PublishResult {
  success: boolean;
  platform: string;
  postId?: string;
  url?: string;
  error?: string;
}

export class MultiPlatformPublisher {
  private tiktok: TikTokUploader;
  private youtube: YouTubeUploader;
  private instagram: InstagramUploader;
  private facebook: FacebookUploader;

  constructor() {
    this.tiktok = new TikTokUploader();
    this.youtube = new YouTubeUploader();
    this.instagram = new InstagramUploader();
    this.facebook = new FacebookUploader();
  }

  async publish(config: PublishConfig): Promise<PublishResult> {
    try {
      switch (config.platform) {
        case 'TIKTOK':
          return await this.tiktok.upload(config);
        case 'YOUTUBE_SHORTS':
          return await this.youtube.upload(config);
        case 'INSTAGRAM_REELS':
          return await this.instagram.upload(config);
        case 'FACEBOOK_REELS':
          return await this.facebook.upload(config);
        default:
          return { success: false, platform: config.platform, error: 'Unsupported platform' };
      }
    } catch (error: any) {
      return { success: false, platform: config.platform, error: error.message };
    }
  }

  async publishToMultiple(configs: PublishConfig[]): Promise<PublishResult[]> {
    return Promise.all(configs.map((config) => this.publish(config)));
  }
}
