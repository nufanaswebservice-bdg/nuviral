import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ScriptGeneratorService } from './services/script-generator.service';
import { HookGeneratorService } from './services/hook-generator.service';
import { CaptionGeneratorService } from './services/caption-generator.service';
import { HashtagGeneratorService } from './services/hashtag-generator.service';
import { ViralPredictionService } from './services/viral-prediction.service';
import { ContentRewriteService } from './services/content-rewrite.service';
import { AiJobProcessor } from './processors/ai-job.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-jobs',
    }),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    ScriptGeneratorService,
    HookGeneratorService,
    CaptionGeneratorService,
    HashtagGeneratorService,
    ViralPredictionService,
    ContentRewriteService,
    AiJobProcessor,
  ],
  exports: [AiService],
})
export class AiModule {}
