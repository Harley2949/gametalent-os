import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobMatchService } from './job-match.service';
import { CalculateMatchDto, BatchCalculateMatchDto, ExtractSkillsDto, AnalyzeCompetitorDto, AiPromptDto } from './dto/job-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AiService } from '../ai/ai.service';

@ApiTags('job-match')
@Controller('job-match')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class JobMatchController {
  constructor(
    private readonly jobMatchService: JobMatchService,
    private readonly aiService: AiService,
  ) {}

  /**
   * 计算候选人和职位的匹配度
   */
  @Post('calculate')
  @RequirePermissions('candidates:view', 'jobs:view')
  @ApiOperation({ summary: '计算候选人和职位的匹配度' })
  async calculateMatch(@Body() dto: CalculateMatchDto) {
    return this.jobMatchService.calculateMatch(dto);
  }

  /**
   * 批量计算匹配度
   */
  @Post('batch')
  @RequirePermissions('candidates:view', 'jobs:view')
  @ApiOperation({ summary: '批量计算候选人和职位的匹配度' })
  async batchCalculateMatch(@Body() dto: BatchCalculateMatchDto) {
    return this.jobMatchService.batchCalculateMatch(dto);
  }

  /**
   * 获取职位的最佳匹配候选人
   */
  @Get('best/:jobId')
  @RequirePermissions('candidates:view', 'jobs:view')
  @ApiOperation({ summary: '获取职位的最佳匹配候选人' })
  async getBestMatches(
    @Param('jobId') jobId: string,
    @Query('limit') limit?: string,
  ) {
    return this.jobMatchService.getBestMatches(
      jobId,
      limit ? parseInt(limit) : 10,
    );
  }

  /**
   * 为职位的所有候选人计算匹配度
   */
  @Post('calculate-all/:jobId')
  @RequirePermissions('jobs:update')
  @ApiOperation({ summary: '为职位的所有候选人计算匹配度' })
  async calculateAllForJob(@Param('jobId') jobId: string) {
    return this.jobMatchService.calculateAllForJob(jobId);
  }

  /**
   * 重新计算候选人的所有职位匹配度
   */
  @Post('recalculate/:candidateId')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '重新计算候选人的所有职位匹配度' })
  async recalculateForCandidate(@Param('candidateId') candidateId: string) {
    return this.jobMatchService.recalculateForCandidate(candidateId);
  }

  /**
   * 获取职位匹配度统计
   */
  @Get('statistics/:jobId')
  @RequirePermissions('jobs:view')
  @ApiOperation({ summary: '获取职位匹配度统计' })
  async getMatchStatistics(@Param('jobId') jobId: string) {
    return this.jobMatchService.getMatchStatistics(jobId);
  }

  /**
   * 提取简历技能
   */
  @Post('extract-skills')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '提取简历技能' })
  async extractSkills(@Body() dto: ExtractSkillsDto) {
    return this.aiService.extractSkills(dto.resumeId);
  }

  /**
   * 分析竞品公司
   */
  @Post('analyze-competitor')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '分析竞品公司' })
  async analyzeCompetitor(@Body() dto: AnalyzeCompetitorDto) {
    return this.aiService.analyzeCompetitorMapping(dto.resumeId);
  }

  /**
   * AI 提示词接口
   */
  @Post('ai-prompt')
  @RequirePermissions('candidates:view', 'jobs:view')
  @ApiOperation({ summary: '通用 AI 提示词接口' })
  async invokeAi(@Body() dto: AiPromptDto) {
    return this.aiService.invoke(dto.prompt);
  }

  /**
   * 清除候选人缓存
   */
  @Post('invalidate-cache/candidate/:candidateId')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '清除候选人缓存' })
  async invalidateCandidateCache(@Param('candidateId') candidateId: string) {
    await this.aiService.invalidateCandidateCache(candidateId);
    return { message: '缓存已清除' };
  }

  /**
   * 清除职位缓存
   */
  @Post('invalidate-cache/job/:jobId')
  @RequirePermissions('jobs:update')
  @ApiOperation({ summary: '清除职位缓存' })
  async invalidateJobCache(@Param('jobId') jobId: string) {
    await this.aiService.invalidateJobCache(jobId);
    return { message: '缓存已清除' };
  }

  /**
   * 清除简历缓存
   */
  @Post('invalidate-cache/resume/:resumeId')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '清除简历缓存' })
  async invalidateResumeCache(@Param('resumeId') resumeId: string) {
    await this.aiService.invalidateResumeCache(resumeId);
    return { message: '缓存已清除' };
  }
}
