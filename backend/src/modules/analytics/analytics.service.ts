import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardAnalytics(userId: string) {
    const analytics = await this.prisma.analytics.findMany({
      where: { socialAccount: { userId } },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });

    const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const totalLikes = analytics.reduce((sum, a) => sum + a.likes, 0);
    const totalComments = analytics.reduce((sum, a) => sum + a.comments, 0);
    const totalShares = analytics.reduce((sum, a) => sum + a.shares, 0);
    const avgEngagement = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + (a.engagementRate || 0), 0) / analytics.length
      : 0;
    const avgWatchTime = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + (a.watchTime || 0), 0) / analytics.length
      : 0;

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagementRate: Math.round(avgEngagement * 100) / 100,
      avgWatchTime: Math.round(avgWatchTime * 10) / 10,
      totalContent: analytics.length,
    };
  }

  async getPlatformAnalytics(userId: string, platform?: string) {
    const where: any = { socialAccount: { userId } };
    if (platform) where.platform = platform;

    return this.prisma.analytics.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });
  }

  async getVideoAnalytics(videoId: string) {
    return this.prisma.analytics.findMany({
      where: { videoId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async getGrowthAnalytics(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.analytics.findMany({
      where: {
        socialAccount: { userId },
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: 'asc' },
    });
  }

  async getBestPostingTimes(userId: string) {
    const analytics = await this.prisma.analytics.findMany({
      where: { socialAccount: { userId }, engagementRate: { gt: 0 } },
      include: { video: true },
      orderBy: { engagementRate: 'desc' },
      take: 50,
    });

    // Analyze posting times of top-performing content
    const timeSlots: Record<string, number[]> = {};
    analytics.forEach((a) => {
      const hour = a.recordedAt.getHours();
      const day = a.recordedAt.toLocaleDateString('en-US', { weekday: 'long' });
      const key = `${day}-${hour}`;
      if (!timeSlots[key]) timeSlots[key] = [];
      timeSlots[key].push(a.engagementRate || 0);
    });

    return Object.entries(timeSlots)
      .map(([key, rates]) => ({
        timeSlot: key,
        avgEngagement: rates.reduce((a, b) => a + b, 0) / rates.length,
        count: rates.length,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 10);
  }
}
