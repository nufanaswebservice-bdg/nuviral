import axios from 'axios';
import { PublishConfig, PublishResult } from '../publisher';

/**
 * Instagram Graph API Integration
 * For publishing Reels via Instagram Content Publishing API
 */
export class InstagramUploader {
  private baseUrl = 'https://graph.facebook.com/v19.0';

  async upload(config: PublishConfig): Promise<PublishResult> {
    try {
      // Step 1: Create media container for Reels
      const containerResponse = await axios.post(
        `${this.baseUrl}/me/media`,
        {
          media_type: 'REELS',
          video_url: config.videoPath, // Must be a publicly accessible URL
          caption: [
            config.caption || config.title,
            '',
            config.hashtags?.join(' ') || '',
          ].join('\n'),
          share_to_feed: true,
        },
        {
          params: { access_token: config.accessToken },
        },
      );

      const containerId = containerResponse.data.id;

      // Step 2: Wait for processing (poll status)
      let status = 'IN_PROGRESS';
      let attempts = 0;
      while (status === 'IN_PROGRESS' && attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const statusResponse = await axios.get(
          `${this.baseUrl}/${containerId}`,
          { params: { fields: 'status_code', access_token: config.accessToken } },
        );
        status = statusResponse.data.status_code;
        attempts++;
      }

      if (status !== 'FINISHED') {
        throw new Error(`Media processing failed with status: ${status}`);
      }

      // Step 3: Publish
      const publishResponse = await axios.post(
        `${this.baseUrl}/me/media_publish`,
        { creation_id: containerId },
        { params: { access_token: config.accessToken } },
      );

      return {
        success: true,
        platform: 'INSTAGRAM_REELS',
        postId: publishResponse.data.id,
      };
    } catch (error: any) {
      return {
        success: false,
        platform: 'INSTAGRAM_REELS',
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }
}
