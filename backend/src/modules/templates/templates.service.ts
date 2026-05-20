import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string, isPremium?: boolean) {
    const where: any = { isPublic: true };
    if (category) where.category = category;
    if (isPremium !== undefined) where.isPremium = isPremium;

    return this.prisma.template.findMany({ where, orderBy: { usageCount: 'desc' } });
  }

  async findById(id: string) {
    return this.prisma.template.findUnique({ where: { id } });
  }

  async create(data: { name: string; description?: string; category?: string; config: any; isPremium?: boolean }) {
    return this.prisma.template.create({ data: { ...data, isPublic: true } });
  }

  async incrementUsage(id: string) {
    return this.prisma.template.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
  }
}
