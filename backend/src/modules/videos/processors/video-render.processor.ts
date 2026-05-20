import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Processor('video-render')
@Injectable()
export class VideoRenderProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ videoId: string; userId: string; settings?: any }>) {
    const { videoId, settings } = job.data;

    // Update status to rendering
    await this.prisma.generatedVideo.update({
      where: { id: videoId },
      data: { status: 'RENDERING', renderProgress: 0 },
    });

    try {
      // Step 1: Prepare assets (20%)
      await job.updateProgress(20);
      await this.prisma.generatedVideo.update({
        where: { id: videoId },
        data: { renderProgress: 20 },
      });

      // Step 2: Generate voiceover (40%)
      await job.updateProgress(40);
      await this.prisma.generatedVideo.update({
        where: { id: videoId },
        data: { renderProgress: 40 },
      });

      // Step 3: Process video with FFmpeg (70%)
      // This would call the ffmpeg-engine service
      await job.updateProgress(70);
      await this.prisma.generatedVideo.update({
        where: { id: videoId },
        data: { renderProgress: 70 },
      });

      // Step 4: Add subtitles and effects (90%)
      await job.updateProgress(90);
      await this.prisma.generatedVideo.update({
        where: { id: videoId },
        data: { renderProgress: 90 },
      });

      // Step 5: Finalize (100%)
      await this.prisma.generatedVideo.update({
        where: { id: videoId },
        data: {
          status: 'COMPLETED',
          renderProgress: 100,
          renderedAt: new Date(),
          filePath: `/renders/${videoId}.mp4`,
          thumbnailPath: `/thumbnails/${videoId}.jpg`,
        },
      });

      await job.updateProgress(100);
      return { videoId, status: 'completed' };
    } catch (error: any) {
      await this.prisma.generatedVideo.update({
        where: { id: videoId },
        data: { status: 'FAILED', errorMessage: error.message },
      });
      throw error;
    }
  }
}
