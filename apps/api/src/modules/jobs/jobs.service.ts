import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  JobStatus,
  JobType,
  WorkMode,
  ExperienceLevel,
  Priority,
} from '@prisma/client';
import { CreateJobDto, UpdateJobDto, QueryJobsDto } from './dto';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * 获取职位列表（支持搜索、筛选、分页）
   */
  async findAll(query: QueryJobsDto, userId?: string) {
    const { skip = 0, take = 10, search, status, department, experienceLevel, priority } = query;

    // 构建查询条件
    const where: any = {};

    // 搜索：标题、描述
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { requirements: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 部门筛选
    if (department) {
      where.department = {
        contains: department,
        mode: 'insensitive',
      };
    }

    // 经验等级筛选
    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    // 优先级筛选
    if (priority) {
      where.priority = priority;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take,
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          assignees: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }

  /**
   * 获取职位详情
   */
  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignees: {
          select: { id: true, name: true, email: true },
        },
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                currentTitle: true,
                currentCompany: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    return job;
  }

  /**
   * 创建职位
   */
  async create(data: CreateJobDto, userId: string) {
    return this.prisma.job.create({
      data: {
        ...data,
        createdBy: userId,
        type: data.type || JobType.FULL_TIME,
        workMode: data.workMode || WorkMode.ONSITE,
        priority: data.priority || Priority.MEDIUM,
        salaryCurrency: data.salaryCurrency || 'CNY',
        remoteRegions: data.remoteRegions || [],
        targetCompanies: data.targetCompanies || [],
        targetSkills: data.targetSkills || [],
        applicantCount: 0,
        interviewCount: 0,
        offerCount: 0,
        status: JobStatus.DRAFT,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * 更新职位信息
   */
  async update(id: string, data: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    // 已发布的职位，修改某些字段需要重新审核（这里简化处理）
    if (job.status === JobStatus.PUBLISHED) {
      // 可以添加额外的验证逻辑
    }

    return this.prisma.job.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除职位
   */
  async remove(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    // 如果有应聘记录，不允许删除
    if (job._count.applications > 0) {
      throw new BadRequestException('该职位已有应聘记录，无法删除。请考虑关闭职位。');
    }

    return this.prisma.job.delete({
      where: { id },
    });
  }

  /**
   * 发布职位
   */
  async publish(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    if (job.status === JobStatus.PUBLISHED) {
      throw new BadRequestException('职位已发布');
    }

    if (job.status === JobStatus.CLOSED) {
      throw new BadRequestException('已关闭的职位无法重新发布，请创建新职位');
    }

    return this.prisma.job.update({
      where: { id },
      data: {
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  /**
   * 关闭职位
   */
  async close(id: string, reason?: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        applications: {
          where: {
            status: {
              notIn: ['REJECTED', 'WITHDRAWN'],
            },
          },
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    if (job.status === JobStatus.CLOSED) {
      throw new BadRequestException('职位已关闭');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        status: JobStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    // 发送职位关闭通知给应聘者
    try {
      const notificationPromises = job.applications.map((application) =>
        this.emailService.sendJobClosed({
          candidateEmail: application.candidate.email,
          candidateName: application.candidate.name,
          jobTitle: job.title,
          reason,
        }),
      );

      await Promise.allSettled(notificationPromises);

      this.logger.log(
        `Job closure notifications sent to ${job.applications.length} candidates`,
      );
    } catch (error) {
      this.logger.error('Failed to send job closure notifications:', error);
      // 不阻断职位关闭流程，邮件发送失败不影响业务
    }

    return updatedJob;
  }

  /**
   * 归档职位
   */
  async archive(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    return this.prisma.job.update({
      where: { id },
      data: {
        status: JobStatus.ARCHIVED,
      },
    });
  }

  /**
   * 分配负责人
   */
  async assignUsers(id: string, userIds: string[]) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    // 验证用户是否存在
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: { id: true },
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException('部分用户不存在');
    }

    return this.prisma.job.update({
      where: { id },
      data: {
        assignees: {
          set: userIds.map(id => ({ id })),
        },
      },
    });
  }

  /**
   * 添加负责人
   */
  async addUser(id: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.prisma.job.update({
      where: { id },
      data: {
        assignees: {
          connect: { id: userId },
        },
      },
    });
  }

  /**
   * 移除负责人
   */
  async removeUser(id: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    return this.prisma.job.update({
      where: { id },
      data: {
        assignees: {
          disconnect: { id: userId },
        },
      },
    });
  }

  /**
   * 更新应聘统计
   */
  async updateStats(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    // 统计各阶段人数
    const applications = await this.prisma.application.findMany({
      where: { jobId: id },
      select: { status: true },
    });

    const interviewCount = await this.prisma.interview.count({
      where: {
        application: {
          jobId: id,
        },
      },
    });

    const offerCount = await this.prisma.offer.count({
      where: {
        application: {
          jobId: id,
        },
        status: 'ACCEPTED',
      },
    });

    return this.prisma.job.update({
      where: { id },
      data: {
        applicantCount: job._count.applications,
        interviewCount,
        offerCount,
      },
    });
  }

  /**
   * 获取职位统计
   */
  async getStatistics() {
    const [
      total,
      byStatus,
      byDepartment,
      byExperienceLevel,
      recentPublished,
      urgentJobs,
    ] = await Promise.all([
      // 总数
      this.prisma.job.count({
        where: {
          status: {
            not: JobStatus.ARCHIVED,
          },
        },
      }),
      // 按状态统计
      this.prisma.job.groupBy({
        by: ['status'],
        _count: true,
      }),
      // 按部门统计
      this.prisma.job.groupBy({
        by: ['department'],
        _count: true,
        where: {
          status: {
            not: JobStatus.ARCHIVED,
          },
        },
      }),
      // 按经验等级统计
      this.prisma.job.groupBy({
        by: ['experienceLevel'],
        _count: true,
        where: {
          status: {
            not: JobStatus.ARCHIVED,
          },
        },
      }),
      // 最近发布（7天内）
      this.prisma.job.count({
        where: {
          publishedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // 紧急职位
      this.prisma.job.count({
        where: {
          status: JobStatus.PUBLISHED,
          priority: Priority.URGENT,
        },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count,
      })),
      byDepartment: byDepartment
        .sort((a, b) => b._count - a._count)
        .slice(0, 10)
        .map(item => ({
          department: item.department,
          count: item._count,
        })),
      byExperienceLevel: byExperienceLevel.map(item => ({
        experienceLevel: item.experienceLevel,
        count: item._count,
      })),
      recentPublished,
      urgentJobs,
    };
  }

  /**
   * 复制职位
   */
  async duplicate(id: string, userId: string) {
    const originalJob = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!originalJob) {
      throw new NotFoundException('职位不存在');
    }

    const { id: _, createdAt, updatedAt, publishedAt, closedAt, ...jobData } = originalJob;

    return this.prisma.job.create({
      data: {
        ...jobData,
        title: `${jobData.title} (副本)`,
        createdBy: userId,
        status: JobStatus.DRAFT,
        publishedAt: null,
        closedAt: null,
        applicantCount: 0,
        interviewCount: 0,
        offerCount: 0,
      },
    });
  }
}
