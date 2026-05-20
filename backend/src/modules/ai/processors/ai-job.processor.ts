import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ScriptGeneratorService } from '../services/script-generator.service';

@Processor('ai-jobs')
@Injectable()
export class AiJobProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private scriptGenerator: ScriptGeneratorService,
  ) {
    super();
  }

  async process(job: Job<any>) {
    const { jobId, type, input } = job.data;

    await this.prisma.aiJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', startedAt: new Date(), progress: 10 },
    });

    try {
      let result: any;

      switch (type) {
        case 'SCRIPT_GENERATION':
          result = await this.scriptGenerator.generate(input);
          break;
        default:
          throw new Error(`Unknown job type: ${type}`);
      }

      await this.prisma.aiJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          output: result,
          completedAt: new Date(),
          progress: 100,
        },
      });

      return result;
    } catch (error: any) {
      await this.prisma.aiJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', errorMessage: error.message },
      });
      throw error;
    }
  }
}
