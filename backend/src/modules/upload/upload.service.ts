import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('upload-queue') private uploadQueue: Queue,
  ) {}

  async scheduleUpload(data: {
    videoId: string;
    socialAccountId: string;
    platform: string;
    scheduledAt?: string;
    caption?: string;
    hashtags?: string[];
  }) {
    const upload = await this.prisma.uploadQueue.create({
      data: {
        videoId: data.videoId,
        socialAccountId: data.socialAccountId,
        platform: data.platform as any,
        status: data.scheduledAt ? 'SCHEDULED' : 'PENDING',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        caption: data.caption,
        hashtags: data.hashtags || [],
      },
    });

    if (!data.scheduledAt) {
      await this.uploadQueue.add('process-upload', {
        uploadId: upload.id,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 10000 },
      });
    }

    return upload;
  }

  async getUploadQueue(userId: string, page = 1, limit = 20) {
    const [uploads, total] = await Promise.all([
      this.prisma.uploadQueue.findMany({
        where: { video: { project: { userId } } },
        include: { video: true, socialAccount: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.uploadQueue.count({ where: { video: { project: { userId } } } }),
    ]);

    return { uploads, total, page, limit };
  }

  async cancelUpload(id: string) {
    return this.prisma.uploadQueue.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async retryUpload(id: string) {
    const upload = await this.prisma.uploadQueue.findUnique({ where: { id } });
    if (!upload) throw new NotFoundException('Upload not found');

    await this.prisma.uploadQueue.update({
      where: { id },
      data: { status: 'PENDING', retryCount: upload.retryCount + 1, errorMessage: null },
    });

    await this.uploadQueue.add('process-upload', { uploadId: id }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 10000 },
    });

    return { message: 'Upload retry queued' };
  }

  async bulkUpload(videoId: string, socialAccountIds: string[], caption?: string, hashtags?: string[]) {
    const uploads = await Promise.all(
      socialAccountIds.map(async (accountId) => {
        const account = await this.prisma.socialAccount.findUnique({ where: { id: accountId } });
        if (!account) return null;

        return this.scheduleUpload({
          videoId,
          socialAccountId: accountId,
          platform: account.platform,
          caption,
          hashtags,
        });
      }),
    );

    return uploads.filter(Boolean);
  }
}
