import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FunnelQueryDto,
  ConversionQueryDto,
  TimeCycleQueryDto,
  SourceQueryDto,
} from './dto/analytics.dto';

/**
 * 招聘漏斗数据
 */
export interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
  conversionRate?: number;
}

/**
 * 转化率数据
 */
export interface ConversionRate {
  stage: string;
  toNext: number;
  toOffer: number;
}

/**
 * 时间周期数据
 */
export interface TimeCycleData {
  stage: string;
  averageDays: number;
  medianDays: number;
  minDays: number;
  maxDays: number;
}

/**
 * 来源效果数据
 */
export interface SourceEffect {
  source: string;
  candidates: number;
  applications: number;
  interviews: number;
  offers: number;
  conversionRate: number;
  avgMatchScore: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 招聘漏斗分析
   *
   * 统计各阶段的候选人数量：
   * 1. 投递数
   * 2. 筛选通过数
   * 3. 面试安排数
   * 4. 面试通过数
   * 5. Offer 发出数
   * 6. 接受 Offer 数
   */
  async getFunnelAnalysis(query: FunnelQueryDto) {
    const { jobId, startDate, endDate } = query;

    // 设置默认日期范围：最近30天
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 59, 999);

    // 基础查询条件
    const baseWhere: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    if (jobId) {
      baseWhere.jobId = jobId;
    }

    // 1. 获取各阶段的数据
    const [applications, screened, interviewed, passed, offers] = await Promise.all([
      // 应聘总数
      this.prisma.application.count({ where: baseWhere }),
      // 筛选通过数（有筛选分数且 >= 60）
      this.prisma.application.count({
        where: {
          ...baseWhere,
          screeningScore: { gte: 60 },
        },
      }),
      // 面试安排数（有关联的面试）
      this.prisma.application.count({
        where: {
          ...baseWhere,
          interviews: { some: {} },
        },
      }),
      // 面试通过数（状态为 INTERVIEW_PASSED）
      this.prisma.application.count({
        where: {
          ...baseWhere,
          status: 'INTERVIEW_PASSED',
        },
      }),
      // Offer 发出数（状态为 OFFERED）
      this.prisma.application.count({
        where: {
          ...baseWhere,
          status: 'OFFERED',
        },
      }),
    ]);

    const total = applications || 1; // 避免除以零

    const funnel: FunnelData[] = [
      {
        stage: '应聘投递',
        count: applications,
        percentage: 100,
      },
      {
        stage: '筛选通过',
        count: screened,
        percentage: Math.round((screened / total) * 100),
        conversionRate: Math.round((screened / (applications || 1)) * 100),
      },
      {
        stage: '面试安排',
        count: interviewed,
        percentage: Math.round((interviewed / total) * 100),
        conversionRate: Math.round((interviewed / (screened || 1)) * 100),
      },
      {
        stage: '面试通过',
        count: passed,
        percentage: Math.round((passed / total) * 100),
        conversionRate: Math.round((passed / (interviewed || 1)) * 100),
      },
      {
        stage: 'Offer 发出',
        count: offers,
        percentage: Math.round((offers / total) * 100),
        conversionRate: Math.round((offers / (passed || 1)) * 100),
      },
    ];

    // 计算整体转化率（投递到 Offer）
    const overallConversionRate = Math.round((offers / total) * 100);

    return {
      funnel,
      overallConversionRate,
      period: { startDate, endDate },
      jobId,
    };
  }

  /**
   * 转化率分析
   *
   * 计算各阶段之间的转化率
   */
  async getConversionRates(query: ConversionQueryDto) {
    const { jobId, startDate, endDate } = query;

    // 设置默认日期范围：最近30天
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 59, 999);

    const baseWhere: any = {
      createdAt: { gte: start, lte: end },
    };

    if (jobId) {
      baseWhere.jobId = jobId;
    }

    // 获取各阶段数据
    const [applications, screened, interviewed, passed, offers] = await Promise.all([
      this.prisma.application.count({ where: baseWhere }),
      this.prisma.application.count({
        where: { ...baseWhere, screeningScore: { gte: 60 } },
      }),
      this.prisma.application.count({
        where: { ...baseWhere, interviews: { some: {} } },
      }),
      this.prisma.application.count({
        where: { ...baseWhere, status: 'INTERVIEW_PASSED' },
      }),
      this.prisma.application.count({
        where: { ...baseWhere, status: 'OFFERED' },
      }),
    ]);

    const total = applications || 1;

    const conversions: ConversionRate[] = [
      {
        stage: '筛选通过率',
        toNext: Math.round((screened / total) * 100),
        toOffer: Math.round((screened / total) * 100),
      },
      {
        stage: '面试转化率',
        toNext: Math.round((interviewed / (screened || 1)) * 100),
        toOffer: Math.round((interviewed / total) * 100),
      },
      {
        stage: '面试通过率',
        toNext: Math.round((passed / (interviewed || 1)) * 100),
        toOffer: Math.round((passed / total) * 100),
      },
      {
        stage: 'Offer 发放率',
        toNext: Math.round((offers / (passed || 1)) * 100),
        toOffer: Math.round((offers / total) * 100),
      },
    ];

    return {
      conversions,
      summary: {
        totalApplications: applications,
        totalOffers: offers,
        overallRate: Math.round((offers / total) * 100),
      },
      period: { startDate, endDate },
    };
  }

  /**
   * 时间周期分析
   *
   * 计算各阶段的平均耗时
   */
  async getTimeCycleAnalysis(query: TimeCycleQueryDto) {
    const { jobId, startDate, endDate } = query;

    // 设置默认日期范围：最近30天
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 59, 999);

    const baseWhere: any = {
      createdAt: { gte: start, lte: end },
    };

    if (jobId) {
      baseWhere.jobId = jobId;
    }

    // 获取所有应聘数据
    const applications = await this.prisma.application.findMany({
      where: baseWhere,
      include: {
        interviews: {
          orderBy: { scheduledAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 计算各阶段耗时（天数）
    const screeningTimes: number[] = [];
    const interviewSchedulingTimes: number[] = [];
    const interviewProcessTimes: number[] = [];
    const offerTimes: number[] = [];

    for (const app of applications) {
      const created = app.createdAt.getTime();
      const now = Date.now();

      // 筛选耗时：创建 → 第一次响应
      if (app.firstResponseAt) {
        screeningTimes.push(
          Math.round((app.firstResponseAt.getTime() - created) / (1000 * 60 * 60 * 24))
        );
      }

      // 面试安排耗时：应聘 → 第一次面试
      if (app.interviews.length > 0) {
        const firstInterview = app.interviews[0];
        if (firstInterview.scheduledAt) {
          interviewSchedulingTimes.push(
            Math.round((firstInterview.scheduledAt.getTime() - created) / (1000 * 60 * 60 * 24))
          );
        }

        // 面试流程耗时：第一次面试 → 最后一次面试
        if (app.interviews.length > 1) {
          const lastInterview = app.interviews[app.interviews.length - 1];
          // 计算面试结束时间：scheduledAt + duration
          const lastInterviewEnd = new Date(lastInterview.scheduledAt.getTime() + lastInterview.duration * 60000);
          interviewProcessTimes.push(
            Math.round(
              (lastInterviewEnd.getTime() - app.interviews[0].scheduledAt.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );
        }

        // Offer 耗时：最后一次面试 → Offer（如果状态是 OFFERED）
        if (app.status === 'OFFERED') {
          const lastInterview = app.interviews[app.interviews.length - 1];
          // 计算面试结束时间：scheduledAt + duration
          const lastInterviewEnd = new Date(lastInterview.scheduledAt.getTime() + lastInterview.duration * 60000);
          if (app.updatedAt) {
            offerTimes.push(
              Math.round((app.updatedAt.getTime() - lastInterviewEnd.getTime()) / (1000 * 60 * 60 * 24))
            );
          }
        }
      }
    }

    // 计算统计数据
    const calculateStats = (times: number[]) => {
      if (times.length === 0) {
        return { averageDays: 0, medianDays: 0, minDays: 0, maxDays: 0 };
      }
      const sorted = [...times].sort((a, b) => a - b);
      const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

      return {
        averageDays: Math.round(avg * 10) / 10,
        medianDays: Math.round(median * 10) / 10,
        minDays: sorted[0],
        maxDays: sorted[sorted.length - 1],
      };
    };

    const timeCycles: TimeCycleData[] = [
      {
        stage: '简历筛选',
        ...calculateStats(screeningTimes),
      },
      {
        stage: '面试安排',
        ...calculateStats(interviewSchedulingTimes),
      },
      {
        stage: '面试流程',
        ...calculateStats(interviewProcessTimes),
      },
      {
        stage: 'Offer 发放',
        ...calculateStats(offerTimes),
      },
    ];

    return {
      timeCycles,
      sampleSize: applications.length,
      period: { startDate, endDate },
    };
  }

  /**
   * 来源效果分析
   *
   * 分析不同渠道的候选人质量和转化效果
   */
  async getSourceEffectiveness(query: SourceQueryDto) {
    const { startDate, endDate, minCandidates } = query;

    // 设置默认日期范围：最近30天
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 59, 999);

    // 按来源分组统计候选人
    const candidatesBySource = await this.prisma.candidate.groupBy({
      by: ['source'],
      where: {
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    });

    const sourceEffects: SourceEffect[] = [];

    for (const sourceData of candidatesBySource) {
      const source = sourceData.source || 'OTHER';
      const candidateCount = sourceData._count;

      // 最小候选人数量过滤
      if (minCandidates && candidateCount < parseInt(minCandidates)) {
        continue;
      }

      // 获取该来源的候选人 IDs
      const candidates = await this.prisma.candidate.findMany({
        where: {
          source,
          createdAt: { gte: start, lte: end },
        },
        select: { id: true },
      });

      const candidateIds = candidates.map((c) => c.id);

      // 统计该来源的应聘数
      const applications = await this.prisma.application.count({
        where: {
          candidateId: { in: candidateIds },
          createdAt: { gte: start, lte: end },
        },
      });

      // 统计面试数
      const interviews = await this.prisma.interview.count({
        where: {
          application: {
            candidateId: { in: candidateIds },
            createdAt: { gte: start, lte: end },
          },
        },
      });

      // 统计 Offer 数
      const offers = await this.prisma.application.count({
        where: {
          candidateId: { in: candidateIds },
          status: 'OFFERED',
          createdAt: { gte: start, lte: end },
        },
      });

      // 计算平均匹配分数
      const appsWithScore = await this.prisma.application.findMany({
        where: {
          candidateId: { in: candidateIds },
          matchScore: { not: null },
          createdAt: { gte: start, lte: end },
        },
        select: { matchScore: true },
      });

      const avgMatchScore =
        appsWithScore.length > 0
          ? appsWithScore.reduce((sum, app) => sum + (app.matchScore || 0), 0) / appsWithScore.length
          : 0;

      sourceEffects.push({
        source,
        candidates: candidateCount,
        applications,
        interviews,
        offers,
        conversionRate: applications > 0 ? Math.round((offers / applications) * 100) : 0,
        avgMatchScore: Math.round(avgMatchScore * 10) / 10,
      });
    }

    // 按转化率排序
    sourceEffects.sort((a, b) => b.conversionRate - a.conversionRate);

    return {
      sources: sourceEffects,
      period: { startDate, endDate },
    };
  }

  /**
   * 总览仪表板数据
   *
   * 提供关键指标概览
   */
  async getDashboardOverview(jobId?: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const baseWhere: any = {
      createdAt: { gte: startDate, lte: endDate },
    };

    if (jobId) {
      baseWhere.jobId = jobId;
    }

    // 并行获取各项数据
    const [
      totalCandidates,
      totalApplications,
      activeJobs,
      totalInterviews,
      offersSent,
      currentApplications,
    ] = await Promise.all([
      // 新增候选人
      this.prisma.candidate.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      // 新增应聘
      this.prisma.application.count({ where: baseWhere }),
      // 活跃职位
      this.prisma.job.count({
        where: { status: 'PUBLISHED' },
      }),
      // 面试安排
      this.prisma.interview.count({
        where: {
          scheduledAt: { gte: startDate, lte: endDate },
        },
      }),
      // Offer 发出
      this.prisma.application.count({
        where: {
          ...baseWhere,
          status: 'OFFERED',
        },
      }),
      // 当前进行中的应聘
      this.prisma.application.count({
        where: {
          status: { in: ['APPLIED', 'SCREENING', 'INTERVIEWING', 'INTERVIEW_PASSED'] },
        },
      }),
    ]);

    // 计算转化率
    const conversionRate = totalApplications > 0 ? Math.round((offersSent / totalApplications) * 100) : 0;

    // 获取趋势数据（最近 7 天）
    const trendData = await this.getTrendData(7, jobId);

    return {
      summary: {
        totalCandidates,
        totalApplications,
        activeJobs,
        totalInterviews,
        offersSent,
        currentApplications,
        conversionRate,
      },
      trend: trendData,
      period: { days, startDate: startDate.toISOString(), endDate: endDate.toISOString() },
    };
  }

  /**
   * 趋势数据（最近 N 天）
   */
  private async getTrendData(days: number, jobId?: string) {
    const trends = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const where: any = {
        createdAt: { gte: date, lte: dateEnd },
      };

      if (jobId) {
        where.jobId = jobId;
      }

      const [apps, offers, interviews] = await Promise.all([
        this.prisma.application.count({ where }),
        this.prisma.application.count({
          where: { ...where, status: 'OFFERED' },
        }),
        this.prisma.interview.count({
          where: { scheduledAt: { gte: date, lte: dateEnd } },
        }),
      ]);

      trends.push({
        date: date.toISOString().split('T')[0],
        applications: apps,
        offers,
        interviews,
      });
    }

    return trends;
  }
}
