import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '../auth';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  FunnelQueryDto,
  ConversionQueryDto,
  TimeCycleQueryDto,
  SourceQueryDto,
} from './dto/analytics.dto';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * 招聘漏斗分析
   *
   * 展示从投递到 Offer 的各阶段人数和转化率
   */
  @Get('funnel')
  @RequirePermissions('candidates:view', 'jobs:view')
  @ApiOperation({ summary: '招聘漏斗分析' })
  async getFunnelAnalysis(@Query() query: FunnelQueryDto) {
    return this.analyticsService.getFunnelAnalysis(query);
  }

  /**
   * 转化率分析
   *
   * 计算各阶段之间的转化率
   */
  @Get('conversion')
  @RequirePermissions('candidates:view', 'jobs:view')
  @ApiOperation({ summary: '转化率分析' })
  async getConversionRates(@Query() query: ConversionQueryDto) {
    return this.analyticsService.getConversionRates(query);
  }

  /**
   * 时间周期分析
   *
   * 分析各阶段的平均耗时
   */
  @Get('time-cycle')
  @RequirePermissions('candidates:view', 'jobs:view')
  @ApiOperation({ summary: '时间周期分析' })
  async getTimeCycleAnalysis(@Query() query: TimeCycleQueryDto) {
    return this.analyticsService.getTimeCycleAnalysis(query);
  }

  /**
   * 来源效果分析
   *
   * 分析不同渠道的候选人质量和转化效果
   */
  @Get('source-effectiveness')
  @RequirePermissions('candidates:view', 'jobs:view')
  @ApiOperation({ summary: '来源效果分析' })
  async getSourceEffectiveness(@Query() query: SourceQueryDto) {
    return this.analyticsService.getSourceEffectiveness(query);
  }

  /**
   * 总览仪表板
   *
   * 提供关键指标概览
   */
  @Get('dashboard')
  @RequirePermissions('candidates:view', 'jobs:view')
  @ApiOperation({ summary: '总览仪表板' })
  async getDashboardOverview(
    @Query('jobId') jobId?: string,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getDashboardOverview(jobId, days ? parseInt(days) : 30);
  }
}
