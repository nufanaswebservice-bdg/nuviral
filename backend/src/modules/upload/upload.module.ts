import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadProcessor } from './processors/upload.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'upload-queue' }),
  ],
  controllers: [UploadController],
  providers: [UploadService, UploadProcessor],
  exports: [UploadService],
})
export class UploadModule {}
