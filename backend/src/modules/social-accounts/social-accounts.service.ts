import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SocialAccountsService {
  constructor(private prisma: PrismaService) {}

  async connect(userId: string, data: {
    platform: string;
    platformUserId?: string;
    username?: string;
    displayName?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: string;
  }) {
    return this.prisma.socialAccount.create({
      data: {
        userId,
        platform: data.platform as any,
        platformUserId: data.platformUserId,
        username: data.username,
        displayName: data.displayName,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiresAt: data.tokenExpiresAt ? new Date(data.tokenExpiresAt) : null,
      },
    });
  }

  async getUserAccounts(userId: string) {
    return this.prisma.socialAccount.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        platform: true,
        username: true,
        displayName: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async disconnect(id: string) {
    return this.prisma.socialAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async refreshTokens(id: string) {
    const account = await this.prisma.socialAccount.findUnique({ where: { id } });
    if (!account) return null;

    // Platform-specific token refresh logic
    // This would call the respective platform's OAuth refresh endpoint
    return account;
  }
}
