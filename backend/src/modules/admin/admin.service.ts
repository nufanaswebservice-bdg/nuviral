import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [users, videos, uploads, subscriptions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.generatedVideo.count(),
      this.prisma.uploadQueue.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.subscription.groupBy({ by: ['plan'], _count: true }),
    ]);
    return { users, videos, uploads, subscriptions };
  }

  async getUsers(page = 1, limit = 50) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        include: { subscription: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, limit };
  }

  async toggleUserStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  async getQueueStatus() {
    const [pending, processing, failed] = await Promise.all([
      this.prisma.aiJob.count({ where: { status: 'PENDING' } }),
      this.prisma.aiJob.count({ where: { status: 'PROCESSING' } }),
      this.prisma.aiJob.count({ where: { status: 'FAILED' } }),
    ]);
    return { pending, processing, failed };
  }
}
