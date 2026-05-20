import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { PublishConfig, PublishResult } from '../publisher';

/**
 * Facebook Graph API Integration
 * For publishing Facebook Reels
 */
export class FacebookUploader {
  private baseUrl = 'https://graph.facebook.com/v19.0';

  async upload(config: PublishConfig): Promise<PublishResult> {
    try {
      // Step 1: Initialize upload session
      const initResponse = await axios.post(
        `${this.baseUrl}/me/video_reels`,
        {
          upload_phase: 'start',
        },
        {
          params: { access_token: config.accessToken },
        },
      );

      const { video_id, upload_url } = initResponse.data;

      // Step 2: Upload video binary
      const videoBuffer = fs.readFileSync(config.videoPath);
      const formData = new FormData();
      formData.append('source', videoBuffer, {
        filename: 'video.mp4',
        contentType: 'video/mp4',
      });

      await axios.post(upload_url, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `OAuth ${config.accessToken}`,
        },
      });

      // Step 3: Finish upload and publish
      const publishResponse = await axios.post(
        `${this.baseUrl}/me/video_reels`,
        {
          upload_phase: 'finish',
          video_id,
          title: config.title,
          description: [
            config.caption || '',
            config.hashtags?.join(' ') || '',
          ].join('\n'),
        },
        {
          params: { access_token: config.accessToken },
        },
      );

      return {
        success: true,
        platform: 'FACEBOOK_REELS',
        postId: publishResponse.data.id || video_id,
      };
    } catch (error: any) {
      return {
        success: false,
        platform: 'FACEBOOK_REELS',
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }
}
