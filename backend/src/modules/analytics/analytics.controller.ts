import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics summary' })
  async getDashboard(@Req() req: any) {
    return this.analyticsService.getDashboardAnalytics(req.user.id);
  }

  @Get('platform')
  @ApiOperation({ summary: 'Get platform-specific analytics' })
  async getPlatform(@Req() req: any, @Query('platform') platform?: string) {
    return this.analyticsService.getPlatformAnalytics(req.user.id, platform);
  }

  @Get('video/:id')
  @ApiOperation({ summary: 'Get video analytics' })
  async getVideo(@Param('id') id: string) {
    return this.analyticsService.getVideoAnalytics(id);
  }

  @Get('growth')
  @ApiOperation({ summary: 'Get growth analytics' })
  async getGrowth(@Req() req: any, @Query('days') days?: number) {
    return this.analyticsService.getGrowthAnalytics(req.user.id, days);
  }

  @Get('best-times')
  @ApiOperation({ summary: 'Get best posting times' })
  async getBestTimes(@Req() req: any) {
    return this.analyticsService.getBestPostingTimes(req.user.id);
  }
}
