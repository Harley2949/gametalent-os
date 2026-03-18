import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus, TransparencyLevel } from '@prisma/client';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  QueryApplicationsDto,
  UpdateStatusDto,
  ScreenApplicationDto,
} from './dto';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * 获取应聘列表（支持筛选、分页）
   */
  async findAll(query: QueryApplicationsDto) {
    const { skip = 0, take = 10, jobId, candidateId, status, source } = query;

    const where: any = {};

    if (jobId) where.jobId = jobId;
    if (candidateId) where.candidateId = candidateId;
    if (status) where.status = status;
    if (source) where.source = source;

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              status: true,
              department: true,
              location: true,
            },
          },
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              phoneNumber: true,
              currentTitle: true,
              currentCompany: true,
              tags: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      meta: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }

  /**
   * 获取应聘详情（包含面试、反馈、Offer）
   */
  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: true,
        interviews: {
          include: {
            interviewer: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { scheduledAt: 'asc' },
        },
        feedback: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        offer: true,
      },
    });

    if (!application) {
      throw new NotFoundException('应聘记录不存在');
    }

    return application;
  }

  /**
   * 创建应聘记录
   */
  async create(data: CreateApplicationDto) {
    // 检查是否已存在
    const existing = await this.prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: data.jobId,
          candidateId: data.candidateId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('该候选人已应聘此职位');
    }

    // 检查职位和候选人是否存在
    const [job, candidate] = await Promise.all([
      this.prisma.job.findUnique({ where: { id: data.jobId } }),
      this.prisma.candidate.findUnique({ where: { id: data.candidateId } }),
    ]);

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    const application = await this.prisma.application.create({
      data: {
        ...data,
        status: ApplicationStatus.APPLIED,
        transparencyLevel: data.transparencyLevel || TransparencyLevel.STANDARD,
      },
      include: {
        job: {
          select: { id: true, title: true, status: true },
        },
        candidate: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // 更新职位应聘计数
    await this.prisma.job.update({
      where: { id: data.jobId },
      data: {
        applicantCount: {
          increment: 1,
        },
      },
    });

    return application;
  }

  /**
   * 更新应聘信息
   */
  async update(id: string, data: UpdateApplicationDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('应聘记录不存在');
    }

    return this.prisma.application.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除应聘记录
   */
  async remove(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('应聘记录不存在');
    }

    return this.prisma.application.delete({
      where: { id },
    });
  }

  /**
   * 更新应聘状态（核心流程）
   */
  async updateStatus(id: string, data: UpdateStatusDto, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('应聘记录不存在');
    }

    // 状态流转验证
    if (!this.isValidStatusTransition(application.status, data.status)) {
      throw new BadRequestException(
        `无法从 ${application.status} 转换到 ${data.status}`,
      );
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: data.status,
        // 如果是筛选相关状态，更新筛选信息
        ...(data.status === ApplicationStatus.SCREENING ||
        data.status === ApplicationStatus.REVIEWED
          ? { screenedBy: userId, screenedAt: new Date() }
          : {}),
        // 如果是关闭状态，记录关闭时间
        ...(data.status === ApplicationStatus.REJECTED ||
        data.status === ApplicationStatus.WITHDRAWN
          ? { closedAt: new Date() }
          : {}),
        // 如果首次响应，记录时间
        ...(application.firstResponseAt === undefined
          ? { firstResponseAt: new Date() }
          : {}),
        // 更新最后联系时间
        lastContactAt: new Date(),
      },
    });

    // 创建流程日志
    await this.prisma.processLog.create({
      data: {
        applicationId: id,
        nodeId: id,
        fromStatus: application.status,
        toStatus: data.status,
        changedBy: userId,
        changeType: 'MANUAL',
        metadata: data.notes ? { notes: data.notes } : null,
      },
    });

    // 发送 Offer 邮件（当状态变为 OFFERED 时）
    if (data.status === ApplicationStatus.OFFERED) {
      try {
        await this.emailService.sendOffer({
          candidateEmail: application.candidate.email,
          candidateName: application.candidate.name,
          jobTitle: application.job.title,
          companyName: 'GameTalent OS',
        });

        this.logger.log(`Offer email sent to ${application.candidate.email}`);
      } catch (error) {
        this.logger.error('Failed to send offer email:', error);
        // 不阻断状态变更流程，邮件发送失败不影响业务
      }
    }

    return updated;
  }

  /**
   * 筛选候选人
   */
  async screen(id: string, data: ScreenApplicationDto, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('应聘记录不存在');
    }

    const updateData: any = {
      screenedBy: userId,
      screenedAt: new Date(),
      screeningScore: data.screeningScore,
      screeningNotes: data.screeningNotes,
    };

    // 根据筛选结果决定状态
    if (data.passed === true) {
      updateData.status = ApplicationStatus.SHORTLISTED;
    } else if (data.passed === false) {
      updateData.status = ApplicationStatus.REJECTED;
      updateData.closedAt = new Date();
    } else {
      updateData.status = ApplicationStatus.REVIEWED;
    }

    return this.prisma.application.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 获取看板视图数据（性能优化版 - 使用 Map 分组）
   * 时间复杂度从 O(9n) 优化到 O(n)
   */
  async getKanbanData(jobId?: string) {
    const where = jobId ? { jobId } : {};

    const applications = await this.prisma.application.findMany({
      where,
      include: {
        job: {
          select: { id: true, title: true },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            avatar: true,
            currentTitle: true,
            currentCompany: true,
            tags: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    // 使用 Map 一次遍历完成分组，时间复杂度 O(n)
    const statusMap = new Map<ApplicationStatus, typeof applications>();

    // 初始化所有状态为空数组
    Object.values(ApplicationStatus).forEach((status) => {
      statusMap.set(status as ApplicationStatus, []);
    });

    // 一次遍历完成分组
    for (const application of applications) {
      const list = statusMap.get(application.status) || [];
      list.push(application);
      statusMap.set(application.status, list);
    }

    // 构建返回结果
    const columns = {
      [ApplicationStatus.APPLIED]: statusMap.get(ApplicationStatus.APPLIED)!,
      [ApplicationStatus.SCREENING]: statusMap.get(ApplicationStatus.SCREENING)!,
      [ApplicationStatus.REVIEWED]: statusMap.get(ApplicationStatus.REVIEWED)!,
      [ApplicationStatus.SHORTLISTED]: statusMap.get(ApplicationStatus.SHORTLISTED)!,
      [ApplicationStatus.INTERVIEWING]: statusMap.get(ApplicationStatus.INTERVIEWING)!,
      [ApplicationStatus.INTERVIEW_PASSED]: statusMap.get(ApplicationStatus.INTERVIEW_PASSED)!,
      [ApplicationStatus.OFFERED]: statusMap.get(ApplicationStatus.OFFERED)!,
      [ApplicationStatus.HIRED]: statusMap.get(ApplicationStatus.HIRED)!,
      [ApplicationStatus.REJECTED]: statusMap.get(ApplicationStatus.REJECTED)!,
    };

    return columns;
  }

  /**
   * 获取应聘统计
   */
  async getStatistics(jobId?: string) {
    const where = jobId ? { jobId } : {};

    const [
      total,
      byStatus,
      bySource,
      thisWeek,
      timeToHire,
    ] = await Promise.all([
      // 总数
      this.prisma.application.count({ where }),
      // 按状态统计
      this.prisma.application.groupBy({
        by: ['status'],
        _count: true,
        where,
      }),
      // 按来源统计
      this.prisma.application.groupBy({
        by: ['source'],
        _count: true,
        where,
      }),
      // 本周新增
      this.prisma.application.count({
        where: {
          ...where,
          appliedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // 平均招聘周期（已入职的）
      this.prisma.application.findMany({
        where: {
          ...where,
          status: ApplicationStatus.HIRED,
        },
        select: {
          appliedAt: true,
          closedAt: true,
        },
      }),
    ]);

    // 计算平均周期（天数）
    const hiredInTime = timeToHire.filter((a) => a.closedAt);
    const avgTimeToHire =
      hiredInTime.length > 0
        ? hiredInTime.reduce((sum, a) => {
            const days =
              (a.closedAt!.getTime() - a.appliedAt.getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / hiredInTime.length
        : 0;

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      bySource: bySource
        .sort((a, b) => b._count - a._count)
        .slice(0, 10)
        .map((item) => ({
          source: item.source || '未知',
          count: item._count,
        })),
      thisWeek,
      avgTimeToHire: Math.round(avgTimeToHire * 10) / 10, // 保留一位小数
    };
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(ids: string[], status: ApplicationStatus, userId: string) {
    const results = {
      success: [] as string[],
      failed: [] as { id: string; reason: string }[],
      total: ids.length,
    };

    for (const id of ids) {
      try {
        await this.updateStatus(id, { status }, userId);
        results.success.push(id);
      } catch (error) {
        results.failed.push({
          id,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  /**
   * 验证状态流转是否合法
   */
  private isValidStatusTransition(
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus,
  ): boolean {
    // 定义允许的状态流转
    const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.APPLIED]: [
        ApplicationStatus.SCREENING,
        ApplicationStatus.REVIEWED,
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.SCREENING]: [
        ApplicationStatus.REVIEWED,
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.REVIEWED]: [
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.SHORTLISTED]: [
        ApplicationStatus.INTERVIEWING,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.INTERVIEWING]: [
        ApplicationStatus.INTERVIEW_PASSED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.INTERVIEW_PASSED]: [
        ApplicationStatus.OFFERED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.OFFERED]: [
        ApplicationStatus.HIRED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.HIRED]: [], // 终态，不能再流转
      [ApplicationStatus.REJECTED]: [], // 终态，不能再流转
      [ApplicationStatus.WITHDRAWN]: [], // 终态，不能再流转
    };

    return transitions[fromStatus]?.includes(toStatus) ?? false;
  }
}
