import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiController } from './ai.controller';
import { AiStudioController } from './controllers/ai-studio.controller';
import { AiService } from './ai.service';
import { AiStudioService } from './services/ai-studio.service';
import { ScriptGeneratorService } from './services/script-generator.service';
import { HookGeneratorService } from './services/hook-generator.service';
import { CaptionGeneratorService } from './services/caption-generator.service';
import { HashtagGeneratorService } from './services/hashtag-generator.service';
import { ViralPredictionService } from './services/viral-prediction.service';
import { ContentRewriteService } from './services/content-rewrite.service';
import { AiJobProcessor } from './processors/ai-job.processor';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-jobs',
    }),
    MediaModule,
  ],
  controllers: [AiController, AiStudioController],
  providers: [
    AiService,
    AiStudioService,
    ScriptGeneratorService,
    HookGeneratorService,
    CaptionGeneratorService,
    HashtagGeneratorService,
    ViralPredictionService,
    ContentRewriteService,
    AiJobProcessor,
  ],
  exports: [AiService, AiStudioService],
})
export class AiModule {}
