import axios from 'axios';
import fs from 'fs';
import { PublishConfig, PublishResult } from '../publisher';

/**
 * YouTube Data API v3 Integration
 * For uploading YouTube Shorts (vertical videos < 60s)
 */
export class YouTubeUploader {
  private baseUrl = 'https://www.googleapis.com/upload/youtube/v3';

  async upload(config: PublishConfig): Promise<PublishResult> {
    try {
      const metadata = {
        snippet: {
          title: config.title.substring(0, 100),
          description: [
            config.caption || '',
            '',
            config.hashtags?.map((h) => `#${h.replace('#', '')}`).join(' ') || '',
            '',
            '#Shorts',
          ].join('\n'),
          tags: config.hashtags?.map((h) => h.replace('#', '')) || [],
          categoryId: '22', // People & Blogs
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
          embeddable: true,
        },
      };

      // Resumable upload
      const initResponse = await axios.post(
        `${this.baseUrl}/videos?uploadType=resumable&part=snippet,status`,
        metadata,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': 'video/mp4',
            'X-Upload-Content-Length': fs.statSync(config.videoPath).size.toString(),
          },
        },
      );

      const uploadUrl = initResponse.headers.location;

      // Upload video
      const videoBuffer = fs.readFileSync(config.videoPath);
      const uploadResponse = await axios.put(uploadUrl, videoBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoBuffer.length.toString(),
        },
      });

      return {
        success: true,
        platform: 'YOUTUBE_SHORTS',
        postId: uploadResponse.data.id,
        url: `https://youtube.com/shorts/${uploadResponse.data.id}`,
      };
    } catch (error: any) {
      return {
        success: false,
        platform: 'YOUTUBE_SHORTS',
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }
}
