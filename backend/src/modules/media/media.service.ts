import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async uploadAsset(userId: string, file: Express.Multer.File, folderId?: string) {
    const type = this.getAssetType(file.mimetype);

    return this.prisma.mediaAsset.create({
      data: {
        userId,
        name: file.originalname,
        type,
        filePath: file.path,
        fileSize: BigInt(file.size),
        mimeType: file.mimetype,
        folderId,
      },
    });
  }

  async getUserAssets(userId: string, type?: string, folderId?: string) {
    const where: any = { userId };
    if (type) where.type = type;
    if (folderId) where.folderId = folderId;

    return this.prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFolder(name: string, parentId?: string) {
    return this.prisma.mediaFolder.create({
      data: { name, parentId },
    });
  }

  async getFolders(parentId?: string) {
    return this.prisma.mediaFolder.findMany({
      where: { parentId: parentId || null },
      include: { children: true, _count: { select: { assets: true } } },
    });
  }

  async deleteAsset(id: string) {
    await this.prisma.mediaAsset.delete({ where: { id } });
    return { message: 'Asset deleted' };
  }

  private getAssetType(mimeType: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FONT' | 'OTHER' {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    if (mimeType.includes('font')) return 'FONT';
    return 'OTHER';
  }
}
