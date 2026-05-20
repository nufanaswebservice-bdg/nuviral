import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { projectId: string; title?: string; scheduledAt: string; platform: string }) {
    return this.prisma.schedule.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        scheduledAt: new Date(data.scheduledAt),
        platform: data.platform as any,
      },
    });
  }

  async getByProject(projectId: string) {
    return this.prisma.schedule.findMany({
      where: { projectId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getCalendar(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.schedule.findMany({
      where: {
        project: { userId },
        scheduledAt: { gte: startDate, lte: endDate },
      },
      include: { project: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async delete(id: string) {
    return this.prisma.schedule.delete({ where: { id } });
  }
}
