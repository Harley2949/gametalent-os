import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService, MatchResult, BatchMatchResult } from '../ai/ai.service';
import { CalculateMatchDto, BatchCalculateMatchDto } from './dto/job-match.dto';

@Injectable()
export class JobMatchService {
  private readonly logger = new Logger(JobMatchService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  /**
   * 计算候选人和职位的匹配度
   */
  async calculateMatch(dto: CalculateMatchDto): Promise<MatchResult> {
    this.logger.log(`计算匹配度: 候选人 ${dto.candidateId} -> 职位 ${dto.jobId}`);

    // 验证候选人和职位是否存在
    const [candidate, job] = await Promise.all([
      this.prisma.candidate.findUnique({
        where: { id: dto.candidateId },
      }),
      this.prisma.job.findUnique({
        where: { id: dto.jobId },
      }),
    ]);

    if (!candidate) {
      throw new NotFoundException(`候选人不存在: ${dto.candidateId}`);
    }

    if (!job) {
      throw new NotFoundException(`职位不存在: ${dto.jobId}`);
    }

    // 使用 AI Service 计算匹配度
    const matchResult = await this.aiService.calculateMatchScore(
      dto.candidateId,
      dto.jobId,
    );

    return matchResult;
  }

  /**
   * 批量计算候选人和职位的匹配度
   */
  async batchCalculateMatch(dto: BatchCalculateMatchDto): Promise<BatchMatchResult[]> {
    this.logger.log(
      `批量计算匹配度: 职位 ${dto.jobId} -> ${dto.candidateIds.length} 个候选人`,
    );

    // 验证职位是否存在
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new NotFoundException(`职位不存在: ${dto.jobId}`);
    }

    // 使用 AI Service 批量计算匹配度
    const results = await this.aiService.batchMatchScores(
      dto.jobId,
      dto.candidateIds,
    );

    return results;
  }

  /**
   * 获取职位的最佳匹配候选人
   */
  async getBestMatches(jobId: string, limit: number = 10) {
    this.logger.log(`获取职位 ${jobId} 的最佳匹配候选人（Top ${limit}）`);

    // 获取所有该职位的应聘记录
    const applications = await this.prisma.application.findMany({
      where: {
        jobId,
        matchScore: {
          not: null,
        },
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        matchScore: 'desc',
      },
      take: limit,
    });

    return applications.map((app) => ({
      candidate: app.candidate,
      applicationId: app.id,
      matchScore: app.matchScore,
      matchDetails: app.matchDetails,
      status: app.status,
      appliedAt: app.createdAt,
    }));
  }

  /**
   * 为职位的所有候选人计算匹配度
   */
  async calculateAllForJob(jobId: string) {
    this.logger.log(`为职位 ${jobId} 的所有候选人计算匹配度`);

    // 获取所有该职位的应聘记录
    const applications = await this.prisma.application.findMany({
      where: { jobId },
      select: {
        id: true,
        candidateId: true,
      },
    });

    if (applications.length === 0) {
      return {
        jobId,
        message: '该职位暂无应聘记录',
        count: 0,
      };
    }

    // 批量计算匹配度
    const candidateIds = applications.map((app) => app.candidateId);
    const results = await this.batchCalculateMatch({
      jobId,
      candidateIds,
    });

    // 统计结果
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return {
      jobId,
      total: results.length,
      success: successCount,
      failed: failCount,
      results,
    };
  }

  /**
   * 重新计算特定候选人的所有职位匹配度
   */
  async recalculateForCandidate(candidateId: string) {
    this.logger.log(`重新计算候选人 ${candidateId} 的所有职位匹配度`);

    // 获取该候选人的所有应聘记录
    const applications = await this.prisma.application.findMany({
      where: { candidateId },
      select: {
        id: true,
        jobId: true,
      },
    });

    if (applications.length === 0) {
      return {
        candidateId,
        message: '该候选人暂无应聘记录',
        count: 0,
      };
    }

    // 逐个计算匹配度
    const results = await Promise.all(
      applications.map((app) =>
        this.calculateMatch({
          candidateId,
          jobId: app.jobId,
        }),
      ),
    );

    return {
      candidateId,
      total: results.length,
      results,
    };
  }

  /**
   * 获取匹配度统计
   */
  async getMatchStatistics(jobId: string) {
    this.logger.log(`获取职位 ${jobId} 的匹配度统计`);

    const applications = await this.prisma.application.findMany({
      where: {
        jobId,
        matchScore: {
          not: null,
        },
      },
      select: {
        matchScore: true,
      },
    });

    if (applications.length === 0) {
      return {
        jobId,
        total: 0,
        average: 0,
        max: 0,
        min: 0,
        distribution: {
          high: 0,  // >=80
          medium: 0, // 60-79
          low: 0,   // <60
        },
      };
    }

    const scores = applications.map((app) => app.matchScore!);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    const distribution = {
      high: scores.filter((s) => s >= 80).length,
      medium: scores.filter((s) => s >= 60 && s < 80).length,
      low: scores.filter((s) => s < 60).length,
    };

    return {
      jobId,
      total: scores.length,
      average: Math.round(average * 100) / 100,
      max,
      min,
      distribution,
    };
  }
}
