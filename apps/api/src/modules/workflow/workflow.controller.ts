import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProcessTemplateDto } from './dto/create-process-template.dto';
import { UpdateProcessTemplateDto } from './dto/update-process-template.dto';
import { CreateProcessNodeDto } from './dto/create-process-node.dto';
import { UpdateProcessNodeDto } from './dto/update-process-node.dto';

@ApiTags('workflow')
@Controller('workflow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  // ========== 流程模板 ==========

  @Post('templates')
  @ApiOperation({ summary: '创建流程模板' })
  createTemplate(@Body() dto: CreateProcessTemplateDto) {
    return this.workflowService.createTemplate(dto);
  }

  @Get('templates')
  @ApiOperation({ summary: '获取所有流程模板' })
  findAllTemplates() {
    return this.workflowService.findAllTemplates();
  }

  @Get('templates/:id')
  @ApiOperation({ summary: '获取流程模板详情' })
  findTemplateById(@Param('id') id: string) {
    return this.workflowService.findTemplateById(id);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: '更新流程模板' })
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateProcessTemplateDto) {
    return this.workflowService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: '删除流程模板' })
  deleteTemplate(@Param('id') id: string) {
    return this.workflowService.deleteTemplate(id);
  }

  @Get('templates/:id/stats')
  @ApiOperation({ summary: '获取流程模板统计' })
  getTemplateStats(@Param('id') id: string) {
    return this.workflowService.getTemplateStats(id);
  }

  @Get('templates/recommend')
  @ApiOperation({ summary: '根据职位类型获取推荐模板' })
  getRecommendedTemplate(@Query('jobType') jobType: string) {
    return this.workflowService.getRecommendedTemplate(jobType);
  }

  // ========== 流程节点 ==========

  @Post('templates/:templateId/nodes')
  @ApiOperation({ summary: '创建流程节点' })
  createNode(@Param('templateId') templateId: string, @Body() dto: CreateProcessNodeDto) {
    return this.workflowService.createNode(templateId, dto);
  }

  @Get('templates/:templateId/nodes')
  @ApiOperation({ summary: '获取模板的所有节点' })
  findNodesByTemplate(@Param('templateId') templateId: string) {
    return this.workflowService.findNodesByTemplate(templateId);
  }

  @Put('nodes/:id')
  @ApiOperation({ summary: '更新流程节点' })
  updateNode(@Param('id') id: string, @Body() dto: UpdateProcessNodeDto) {
    return this.workflowService.updateNode(id, dto);
  }

  @Delete('nodes/:id')
  @ApiOperation({ summary: '删除流程节点' })
  deleteNode(@Param('id') id: string) {
    return this.workflowService.deleteNode(id);
  }
}
