import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VideosService } from './videos.service';

@ApiTags('Videos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('videos')
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  @ApiOperation({ summary: 'Create and queue video for rendering' })
  async createVideo(@Req() req: any, @Body() body: {
    projectId: string;
    scriptId?: string;
    title: string;
    templateId?: string;
    settings?: any;
  }) {
    return this.videosService.createVideo(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get user videos' })
  async getUserVideos(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.videosService.getUserVideos(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  async getVideo(@Param('id') id: string) {
    return this.videosService.getVideoById(id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get render progress' })
  async getRenderProgress(@Param('id') id: string) {
    return this.videosService.getRenderProgress(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete video' })
  async deleteVideo(@Param('id') id: string) {
    return this.videosService.deleteVideo(id);
  }

  @Post('batch-render')
  @ApiOperation({ summary: 'Batch render multiple videos' })
  async batchRender(@Req() req: any, @Body() body: { videoIds: string[] }) {
    return this.videosService.batchRender(req.user.id, body.videoIds);
  }
}
