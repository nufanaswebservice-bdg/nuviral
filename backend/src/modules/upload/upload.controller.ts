import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@ApiTags('Upload Queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule video upload' })
  async scheduleUpload(@Body() body: {
    videoId: string;
    socialAccountId: string;
    platform: string;
    scheduledAt?: string;
    caption?: string;
    hashtags?: string[];
  }) {
    return this.uploadService.scheduleUpload(body);
  }

  @Get('queue')
  @ApiOperation({ summary: 'Get upload queue' })
  async getQueue(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.uploadService.getUploadQueue(req.user.id, page, limit);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel upload' })
  async cancelUpload(@Param('id') id: string) {
    return this.uploadService.cancelUpload(id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry failed upload' })
  async retryUpload(@Param('id') id: string) {
    return this.uploadService.retryUpload(id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk upload to multiple platforms' })
  async bulkUpload(@Body() body: {
    videoId: string;
    socialAccountIds: string[];
    caption?: string;
    hashtags?: string[];
  }) {
    return this.uploadService.bulkUpload(body.videoId, body.socialAccountIds, body.caption, body.hashtags);
  }
}
