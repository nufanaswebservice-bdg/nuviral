import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new project' })
  async create(@Req() req: any, @Body() body: { name: string; description?: string; niche?: string }) {
    return this.projectsService.create(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  async findAll(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.projectsService.findAll(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  async findById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  async update(@Param('id') id: string, @Body() body: { name?: string; description?: string; niche?: string }) {
    return this.projectsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  async delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }
}
