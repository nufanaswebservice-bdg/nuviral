import axios from 'axios';
import fs from 'fs';
import { PublishConfig, PublishResult } from '../publisher';

/**
 * TikTok Content Posting API Integration
 * Uses official TikTok API for content publishing
 * Docs: https://developers.tiktok.com/doc/content-posting-api-get-started
 */
export class TikTokUploader {
  private baseUrl = 'https://open.tiktokapis.com/v2';

  async upload(config: PublishConfig): Promise<PublishResult> {
    try {
      // Step 1: Initialize upload
      const initResponse = await axios.post(
        `${this.baseUrl}/post/publish/inbox/video/init/`,
        {
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: fs.statSync(config.videoPath).size,
            chunk_size: fs.statSync(config.videoPath).size,
            total_chunk_count: 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { upload_url, publish_id } = initResponse.data.data;

      // Step 2: Upload video file
      const videoBuffer = fs.readFileSync(config.videoPath);
      await axios.put(upload_url, videoBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Range': `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
        },
      });

      // Step 3: Publish with caption
      const caption = [
        config.caption || config.title,
        config.hashtags?.join(' ') || '',
      ].filter(Boolean).join('\n\n');

      await axios.post(
        `${this.baseUrl}/post/publish/video/init/`,
        {
          post_info: {
            title: caption.substring(0, 2200),
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: upload_url,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: true,
        platform: 'TIKTOK',
        postId: publish_id,
      };
    } catch (error: any) {
      return {
        success: false,
        platform: 'TIKTOK',
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }
}
