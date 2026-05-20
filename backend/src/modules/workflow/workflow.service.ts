import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

export interface WorkflowConfig {
  name: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  type: 'generate_script' | 'generate_video' | 'render' | 'schedule' | 'publish' | 'analyze';
  config: Record<string, any>;
}

@Injectable()
export class WorkflowService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('workflow') private workflowQueue: Queue,
  ) {}

  async createWorkflow(userId: string, config: WorkflowConfig) {
    const job = await this.prisma.aiJob.create({
      data: {
        userId,
        type: 'SCRIPT_GENERATION', // Workflow type
        input: config as any,
        status: 'QUEUED',
      },
    });

    await this.workflowQueue.add('execute-workflow', {
      jobId: job.id,
      userId,
      config,
    }, {
      attempts: 1,
    });

    return { workflowId: job.id, status: 'queued', steps: config.steps.length };
  }

  async getWorkflowStatus(workflowId: string) {
    return this.prisma.aiJob.findUnique({ where: { id: workflowId } });
  }

  async getUserWorkflows(userId: string) {
    return this.prisma.aiJob.findMany({
      where: { userId, type: 'SCRIPT_GENERATION' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
