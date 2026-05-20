import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        subscription: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, avatar: true },
    });
  }

  async getDashboardStats(userId: string) {
    const [videosCount, scriptsCount, uploadsCount, socialAccounts] = await Promise.all([
      this.prisma.generatedVideo.count({ where: { project: { userId } } }),
      this.prisma.aiScript.count({ where: { project: { userId } } }),
      this.prisma.uploadQueue.count({ where: { video: { project: { userId } }, status: 'PUBLISHED' } }),
      this.prisma.socialAccount.count({ where: { userId } }),
    ]);

    return { videosCount, scriptsCount, uploadsCount, socialAccounts };
  }
}
