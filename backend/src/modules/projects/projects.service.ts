import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { name: string; description?: string; niche?: string }) {
    return this.prisma.project.create({
      data: { ...data, userId },
    });
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { userId, status: 'ACTIVE' },
        include: { _count: { select: { aiScripts: true, videos: true } } },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where: { userId, status: 'ACTIVE' } }),
    ]);
    return { projects, total, page, limit };
  }

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { aiScripts: true, videos: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, data: { name?: string; description?: string; niche?: string }) {
    return this.prisma.project.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.project.update({ where: { id }, data: { status: 'DELETED' } });
  }
}
