import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../auth';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('match')
  @RequirePermissions('candidates:view', 'jobs:view')
  @ApiOperation({ summary: '计算候选人与职位的匹配分数' })
  async calculateMatch(@Body('candidateId') candidateId: string, @Body('jobId') jobId: string) {
    return this.aiService.calculateMatchScore(candidateId, jobId);
  }

  @Post('match/batch')
  @RequirePermissions('candidates:view', 'jobs:view')
  @ApiOperation({ summary: '批量计算匹配分数' })
  async batchMatch(@Body('jobId') jobId: string, @Body('candidateIds') candidateIds: string[]) {
    return this.aiService.batchMatchScores(jobId, candidateIds);
  }

  @Post('extract-skills/:resumeId')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '从简历中提取技能' })
  async extractSkills(@Param('resumeId') resumeId: string) {
    return this.aiService.extractSkills(resumeId);
  }

  @Post('analyze-competitors/:resumeId')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '分析简历中的竞争对手映射' })
  async analyzeCompetitors(@Param('resumeId') resumeId: string) {
    return this.aiService.analyzeCompetitorMapping(resumeId);
  }

  @Get('health')
  @RequirePermissions('system:viewSettings')
  @ApiOperation({ summary: '检查 AI 服务健康状态' })
  async healthCheck() {
    return {
      status: 'ok',
      ollamaUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama2',
    };
  }
}
