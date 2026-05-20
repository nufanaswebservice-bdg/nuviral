import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { VideoRenderProcessor } from './processors/video-render.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'video-render' }),
  ],
  controllers: [VideosController],
  providers: [VideosService, VideoRenderProcessor],
  exports: [VideosService],
})
export class VideosModule {}
