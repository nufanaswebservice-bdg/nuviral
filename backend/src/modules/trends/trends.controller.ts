import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrendsService } from './trends.service';

@ApiTags('Trends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trends')
export class TrendsController {
  constructor(private trendsService: TrendsService) {}

  @Get('analyze')
  @ApiOperation({ summary: 'Analyze platform trends' })
  async analyzeTrends(@Query('platform') platform: string, @Query('niche') niche?: string) {
    return this.trendsService.analyzeTrends(platform, niche);
  }

  @Get('hashtags')
  @ApiOperation({ summary: 'Get viral hashtags' })
  async getHashtags(@Query('platform') platform: string, @Query('category') category?: string) {
    return this.trendsService.getViralHashtags(platform, category);
  }

  @Post('competitor')
  @ApiOperation({ summary: 'Analyze competitor' })
  async analyzeCompetitor(@Body() body: { username: string; platform: string }) {
    return this.trendsService.analyzeCompetitor(body.username, body.platform);
  }
}
