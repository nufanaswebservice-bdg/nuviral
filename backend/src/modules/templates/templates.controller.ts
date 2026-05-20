import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TemplatesService } from './templates.service';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  async findAll(@Query('category') category?: string, @Query('premium') premium?: string) {
    return this.templatesService.findAll(category, premium === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  async findById(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create template' })
  async create(@Body() body: { name: string; description?: string; category?: string; config: any }) {
    return this.templatesService.create(body);
  }
}
