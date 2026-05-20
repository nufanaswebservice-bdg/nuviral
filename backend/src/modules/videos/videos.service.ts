import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('video-render') private renderQueue: Queue,
  ) {}

  async createVideo(userId: string, data: {
    projectId: string;
    scriptId?: string;
    title: string;
    templateId?: string;
    settings?: any;
  }) {
    const video = await this.prisma.generatedVideo.create({
      data: {
        projectId: data.projectId,
        scriptId: data.scriptId,
        title: data.title,
        templateId: data.templateId,
        settings: data.settings,
        status: 'QUEUED',
      },
    });

    // Add to render queue
    await this.renderQueue.add('render-video', {
      videoId: video.id,
      userId,
      settings: data.settings,
    }, {
      priority: 1,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    return video;
  }

  async getUserVideos(userId: string, page = 1, limit = 20) {
    const [videos, total] = await Promise.all([
      this.prisma.generatedVideo.findMany({
        where: { project: { userId } },
        include: { script: true, template: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.generatedVideo.count({ where: { project: { userId } } }),
    ]);

    return { videos, total, page, limit };
  }

  async getVideoById(id: string) {
    const video = await this.prisma.generatedVideo.findUnique({
      where: { id },
      include: { script: true, template: true, uploadQueue: true },
    });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async deleteVideo(id: string) {
    await this.prisma.generatedVideo.delete({ where: { id } });
    return { message: 'Video deleted' };
  }

  async getRenderProgress(videoId: string) {
    const video = await this.prisma.generatedVideo.findUnique({
      where: { id: videoId },
      select: { id: true, status: true, renderProgress: true },
    });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async batchRender(userId: string, videoIds: string[]) {
    const jobs = videoIds.map((videoId, index) => ({
      name: 'render-video',
      data: { videoId, userId },
      opts: { priority: index + 1, attempts: 3 },
    }));

    await this.renderQueue.addBulk(jobs);
    return { message: `${videoIds.length} videos queued for rendering` };
  }
}
