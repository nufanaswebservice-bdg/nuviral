import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { ScriptGeneratorService } from './services/script-generator.service';
import { HookGeneratorService } from './services/hook-generator.service';
import { CaptionGeneratorService } from './services/caption-generator.service';
import { HashtagGeneratorService } from './services/hashtag-generator.service';
import { ViralPredictionService } from './services/viral-prediction.service';
import { ContentRewriteService } from './services/content-rewrite.service';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('ai-jobs') private aiQueue: Queue,
    private scriptGenerator: ScriptGeneratorService,
    private hookGenerator: HookGeneratorService,
    private captionGenerator: CaptionGeneratorService,
    private hashtagGenerator: HashtagGeneratorService,
    private viralPrediction: ViralPredictionService,
    private contentRewrite: ContentRewriteService,
  ) {}

  async generateScript(userId: string, input: {
    niche: string;
    topic?: string;
    tone?: string;
    duration?: number;
    platform?: string;
    language?: string;
  }) {
    const job = await this.prisma.aiJob.create({
      data: {
        userId,
        type: 'SCRIPT_GENERATION',
        input: input as any,
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    });

    try {
      const result = await this.scriptGenerator.generate(input);

      // Save as AI Script
      const script = await this.prisma.aiScript.create({
        data: {
          projectId: input.topic || 'default',
          title: result.title,
          hook: result.hook,
          script: result.script,
          caption: result.caption,
          cta: result.cta,
          hashtags: result.hashtags,
          niche: input.niche,
          tone: input.tone,
          duration: result.estimatedDuration,
          viralScore: result.viralScore,
          status: 'DRAFT',
        },
      });

      await this.prisma.aiJob.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', output: result as any, completedAt: new Date(), progress: 100 },
      });

      return { jobId: job.id, script, result };
    } catch (error: any) {
      await this.prisma.aiJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', errorMessage: error.message },
      });
      throw error;
    }
  }

  async generateHook(userId: string, input: { niche: string; topic: string; style?: string }) {
    const result = await this.hookGenerator.generate(input);
    return result;
  }

  async generateCaption(userId: string, input: { script: string; platform: string; tone?: string }) {
    const result = await this.captionGenerator.generate(input);
    return result;
  }

  async generateHashtags(userId: string, input: { topic: string; platform: string; niche?: string }) {
    const result = await this.hashtagGenerator.generate(input);
    return result;
  }

  async predictViralScore(userId: string, input: { script: string; platform: string; niche: string }) {
    const result = await this.viralPrediction.predict(input);
    return result;
  }

  async rewriteContent(userId: string, input: { content: string; style: string; tone?: string }) {
    const result = await this.contentRewrite.rewrite(input);
    return result;
  }

  async getJobStatus(jobId: string) {
    return this.prisma.aiJob.findUnique({ where: { id: jobId } });
  }

  async getUserJobs(userId: string, page = 1, limit = 20) {
    const [jobs, total] = await Promise.all([
      this.prisma.aiJob.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.aiJob.count({ where: { userId } }),
    ]);

    return { jobs, total, page, limit };
  }
}
