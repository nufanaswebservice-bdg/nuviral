import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchedulesService } from './schedules.service';

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create schedule' })
  async create(@Body() body: { projectId: string; title?: string; scheduledAt: string; platform: string }) {
    return this.schedulesService.create(body);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get schedules by project' })
  async getByProject(@Param('projectId') projectId: string) {
    return this.schedulesService.getByProject(projectId);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get content calendar' })
  async getCalendar(@Req() req: any, @Query('month') month: number, @Query('year') year: number) {
    return this.schedulesService.getCalendar(req.user.id, month, year);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete schedule' })
  async delete(@Param('id') id: string) {
    return this.schedulesService.delete(id);
  }
}
