import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { CloudflareR2Service } from './cloudflare-r2.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService, CloudflareR2Service],
  exports: [MediaService, CloudflareR2Service],
})
export class MediaModule {}
