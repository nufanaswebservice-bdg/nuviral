import { Controller, Post, Get, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@ApiTags('AI Content Generation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate/script')
  @ApiOperation({ summary: 'Generate viral script with AI' })
  async generateScript(@Req() req: any, @Body() body: {
    niche: string;
    topic?: string;
    tone?: string;
    duration?: number;
    platform?: string;
    language?: string;
  }) {
    return this.aiService.generateScript(req.user.id, body);
  }

  @Post('generate/hook')
  @ApiOperation({ summary: 'Generate 3-second hook' })
  async generateHook(@Req() req: any, @Body() body: {
    niche: string;
    topic: string;
    style?: string;
  }) {
    return this.aiService.generateHook(req.user.id, body);
  }

  @Post('generate/caption')
  @ApiOperation({ summary: 'Generate social media caption' })
  async generateCaption(@Req() req: any, @Body() body: {
    script: string;
    platform: string;
    tone?: string;
  }) {
    return this.aiService.generateCaption(req.user.id, body);
  }

  @Post('generate/hashtags')
  @ApiOperation({ summary: 'Generate optimized hashtags' })
  async generateHashtags(@Req() req: any, @Body() body: {
    topic: string;
    platform: string;
    niche?: string;
  }) {
    return this.aiService.generateHashtags(req.user.id, body);
  }

  @Post('predict/viral-score')
  @ApiOperation({ summary: 'Predict viral score for content' })
  async predictViralScore(@Req() req: any, @Body() body: {
    script: string;
    platform: string;
    niche: string;
  }) {
    return this.aiService.predictViralScore(req.user.id, body);
  }

  @Post('rewrite')
  @ApiOperation({ summary: 'Rewrite and optimize content' })
  async rewriteContent(@Req() req: any, @Body() body: {
    content: string;
    style: string;
    tone?: string;
  }) {
    return this.aiService.rewriteContent(req.user.id, body);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get user AI jobs' })
  async getUserJobs(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.aiService.getUserJobs(req.user.id, page, limit);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get AI job status' })
  async getJobStatus(@Param('id') id: string) {
    return this.aiService.getJobStatus(id);
  }
}
