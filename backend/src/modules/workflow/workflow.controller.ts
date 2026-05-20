import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkflowService, WorkflowConfig } from './workflow.service';

@ApiTags('Workflow Automation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(private workflowService: WorkflowService) {}

  @Post()
  @ApiOperation({ summary: 'Create and execute workflow' })
  async create(@Req() req: any, @Body() body: WorkflowConfig) {
    return this.workflowService.createWorkflow(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get user workflows' })
  async getAll(@Req() req: any) {
    return this.workflowService.getUserWorkflows(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow status' })
  async getStatus(@Param('id') id: string) {
    return this.workflowService.getWorkflowStatus(id);
  }
}
