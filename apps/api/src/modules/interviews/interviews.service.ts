import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InterviewStatus } from '@prisma/client';
import { CreateInterviewDto, UpdateInterviewDto, QueryInterviewsDto, InterviewFeedbackDto } from './dto';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * 获取面试列表
   */
  async findAll(query: QueryInterviewsDto) {
    const { skip = 0, take = 10, applicationId, interviewerId, status, stage, startDate, endDate } = query;

    const where: any = {};

    if (applicationId) where.applicationId = applicationId;
    if (interviewerId) where.interviewerId = interviewerId;
    if (status) where.status = status;
    if (stage) where.stage = stage;

    // 日历视图的时间范围筛选
    if (startDate && endDate) {
      where.scheduledAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.scheduledAt = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.scheduledAt = {
        lte: new Date(endDate),
      };
    }

    const [interviews, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        skip,
        take,
        include: {
          application: {
            include: {
              candidate: { select: { id: true, name: true, email: true, avatar: true } },
              job: { select: { id: true, title: true } },
            },
          },
          interviewer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.interview.count({ where }),
    ]);

    return {
      data: interviews,
      meta: { total, skip, take, hasMore: skip + take < total },
    };
  }

  /**
   * 获取日历视图数据
   */
  async getCalendarEvents(startDate: Date, endDate: Date, interviewerId?: string) {
    const where: any = {
      scheduledAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: InterviewStatus.CANCELLED,
      },
    };

    if (interviewerId) {
      where.interviewerId = interviewerId;
    }

    const interviews = await this.prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            candidate: { select: { id: true, name: true } },
            job: { select: { id: true, title: true } },
          },
        },
        interviewer: {
          select: { id: true, name: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    // 转换为日历事件格式
    return interviews.map((interview) => ({
      id: interview.id,
      title: interview.title,
      start: interview.scheduledAt,
      end: new Date(interview.scheduledAt.getTime() + interview.duration * 60000),
      candidateName: interview.application.candidate.name,
      jobTitle: interview.application.job.title,
      stage: interview.stage,
      status: interview.status,
      interviewerId: interview.interviewerId,
      interviewerName: interview.interviewer.name,
    }));
  }

  /**
   * 获取面试详情
   */
  async findOne(id: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        interviewer: {
          select: { id: true, name: true, email: true, title: true },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('面试记录不存在');
    }

    return interview;
  }

  /**
   * 创建面试
   */
  async create(data: CreateInterviewDto) {
    this.logger.log('📝 [创建面试] 收到请求:', JSON.stringify(data, null, 2));

    try {
      // 验证时间格式
      let scheduledDate: Date;
      try {
        scheduledDate = new Date(data.scheduledAt);
        if (isNaN(scheduledDate.getTime())) {
          throw new Error('无效的日期格式');
        }
        this.logger.log(`✅ 时间解析成功: ${scheduledDate.toISOString()}`);
      } catch (error) {
        this.logger.error(`❌ 时间格式错误: ${data.scheduledAt}`, error);
        throw new BadRequestException(`面试时间格式错误，请使用 ISO 8601 格式（如：2026-03-18T10:00:00Z）。收到: ${data.scheduledAt}`);
      }

      let application;

      // 如果提供了applicationId，直接使用
      if (data.applicationId) {
        this.logger.log(`🔍 使用应聘ID: ${data.applicationId}`);
        application = await this.prisma.application.findUnique({
          where: { id: data.applicationId },
          include: {
            candidate: { select: { id: true, name: true, email: true } },
            job: { select: { id: true, title: true } },
          },
        });

        if (!application) {
          this.logger.error(`❌ 应聘记录不存在: ${data.applicationId}`);
          throw new NotFoundException(`应聘记录不存在（ID: ${data.applicationId}）`);
        }
        this.logger.log(`✅ 找到应聘记录: ${application.job.title} - ${application.candidate.name}`);
      } else if (data.candidateId) {
        // 如果只提供了candidateId，查找候选人最新的应聘记录
        this.logger.log(`🔍 使用候选人ID: ${data.candidateId}，查找最新应聘记录`);

        // 检测Mock数据ID
        if (data.candidateId.startsWith('mock-') || data.candidateId.startsWith('test')) {
          this.logger.warn(`⚠️ 检测到Mock数据ID: ${data.candidateId}`);
          throw new BadRequestException(
            `所选候选人来自Mock数据，无法创建真实面试记录。\n\n解决方案：\n1. 请刷新页面，从后端数据库加载真实候选人\n2. 或先在候选人管理页面创建候选人记录`
          );
        }

        // 先验证候选人是否存在
        const candidateExists = await this.prisma.candidate.findUnique({
          where: { id: data.candidateId },
          select: { id: true, name: true, email: true },
        });

        if (!candidateExists) {
          this.logger.error(`❌ 候选人不存在: ${data.candidateId}`);
          this.logger.error(`💡 提示：数据库中的候选人IDs:`, (await this.prisma.candidate.findMany({
            select: { id: true, name: true },
            take: 5,
          })).map(c => `${c.id} (${c.name})`));
          throw new NotFoundException(
            `候选人不存在（ID: ${data.candidateId}）。\n\n可能原因：\n1. 前端显示的是Mock数据，后端数据库中没有此候选人\n2. 候选人记录已被删除\n3. ID不匹配\n\n建议：刷新页面，从后端重新加载候选人列表`
          );
        }

        this.logger.log(`✅ 候选人验证通过: ${candidateExists.name} (${candidateExists.email})`);

        application = await this.prisma.application.findFirst({
          where: { candidateId: data.candidateId },
          include: {
            candidate: { select: { id: true, name: true, email: true } },
            job: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!application) {
          this.logger.warn(`⚠️ 候选人 ${candidateExists.name} 暂无应聘记录，自动创建`);

          // 自动查找或创建一个默认职位
          let job = await this.prisma.job.findFirst({
            where: { status: 'PUBLISHED' },
            select: { id: true, title: true },
          });

          if (!job) {
            this.logger.log('📝 创建默认职位...');

            // 先查找一个可用的用户作为创建者
            const defaultUser = await this.prisma.user.findFirst({
              select: { id: true },
            });

            if (!defaultUser) {
              throw new Error('系统中没有用户，无法创建默认职位');
            }

            job = await this.prisma.job.create({
              data: {
                title: '通用职位',
                description: '系统自动创建的默认职位',
                requirements: '暂无具体要求',
                responsibilities: '待定',
                department: '待定',
                location: '待定',
                type: 'FULL_TIME',
                status: 'PUBLISHED',
                experienceLevel: 'MID',
                priority: 'MEDIUM',
                creator: {
                  connect: { id: defaultUser.id },
                },
              },
              select: { id: true, title: true },
            });
            this.logger.log(`✅ 默认职位创建成功: ${job.title}`);
          }

          // 为候选人创建应聘记录
          this.logger.log(`📝 为候选人创建应聘记录...`);
          application = await this.prisma.application.create({
            data: {
              candidateId: candidateExists.id,
              jobId: job.id,
              status: 'APPLIED',
            },
            include: {
              candidate: { select: { id: true, name: true, email: true } },
              job: { select: { id: true, title: true } },
            },
          });
          this.logger.log(`✅ 应聘记录创建成功: ${application.job.title}`);
        }
        this.logger.log(`✅ 使用应聘记录: ${application.job.title} (${application.id})`);
      } else {
        this.logger.error(`❌ 缺少必要参数：既未提供applicationId也未提供candidateId`);
        throw new BadRequestException('必须提供applicationId或candidateId之一');
      }

      // 确定面试官
      let interviewerId = data.interviewerId;
      if (!interviewerId) {
        this.logger.log('🔍 未指定面试官，查找默认面试官...');
        // 如果没有指定面试官，使用系统默认面试官或第一个管理员
        const defaultInterviewer = await this.prisma.user.findFirst({
          where: { role: { in: ['ADMIN', 'RECRUITER'] } },
          select: { id: true, name: true },
        });
        if (!defaultInterviewer) {
          this.logger.error(`❌ 系统中没有可用的面试官账号`);
          throw new BadRequestException('系统中没有可用的面试官账号（ADMIN或RECRUITER角色），请先创建用户账号');
        }
        interviewerId = defaultInterviewer.id;
        this.logger.log(`✅ 使用默认面试官: ${defaultInterviewer.name} (${defaultInterviewer.id})`);
      }

      const interviewer = await this.prisma.user.findUnique({
        where: { id: interviewerId },
        select: { id: true, name: true },
      });

      if (!interviewer) {
        this.logger.error(`❌ 面试官不存在: ${interviewerId}`);
        throw new NotFoundException(`指定的面试官不存在（ID: ${interviewerId}）`);
      }

      // 创建面试记录
      this.logger.log('💾 开始创建面试记录...');
      const interview = await this.prisma.interview.create({
        data: {
          applicationId: application.id,
          interviewerId: interviewerId,
          title: data.title,
          description: data.description,
          type: data.type,
          stage: data.stage,
          scheduledAt: scheduledDate,
          duration: data.duration,
          location: data.location,
          notes: data.notes,
          status: InterviewStatus.SCHEDULED,
        },
        include: {
          application: {
            include: {
              candidate: { select: { id: true, name: true } },
              job: { select: { id: true, title: true } },
            },
          },
          interviewer: { select: { id: true, name: true } },
        },
      });

      this.logger.log(`✅ 面试创建成功: ${interview.id} - ${interview.title}`);

      // 更新应聘状态
      if (application.status === 'SHORTLISTED' || application.status === 'APPLIED') {
        this.logger.log(`🔄 更新应聘状态: ${application.status} -> INTERVIEWING`);
        await this.prisma.application.update({
          where: { id: application.id },
          data: { status: 'INTERVIEWING' },
        });
      }

      return interview;
    } catch (error) {
      this.logger.error('❌ 创建面试失败:', error);
      // 如果是已知的业务异常，直接抛出
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      // 其他未知错误，包装一下
      throw new BadRequestException(`创建面试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 更新面试信息
   */
  async update(id: string, data: UpdateInterviewDto) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('面试记录不存在');
    }

    const updateData: any = { ...data };

    // 转换日期
    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }
    if (data.followUpAt) {
      updateData.followUpAt = new Date(data.followUpAt);
    }

    return this.prisma.interview.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 删除面试
   */
  async remove(id: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('面试记录不存在');
    }

    return this.prisma.interview.delete({
      where: { id },
    });
  }

  /**
   * 提交面试反馈
   */
  async submitFeedback(id: string, data: InterviewFeedbackDto, userId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('面试记录不存在');
    }

    // 更新面试记录
    const updatedInterview = await this.prisma.interview.update({
      where: { id },
      data: {
        score: data.score,
        notes: data.notes,
        feedback: {
          pros: data.pros,
          cons: data.cons,
          tags: data.tags || [],
        },
        status: InterviewStatus.COMPLETED,
      },
    });

    // 创建独立的反馈记录
    await this.prisma.feedback.create({
      data: {
        applicationId: interview.applicationId,
        interviewId: id,
        authorId: userId,
        type: 'INTERVIEW',
        rating: data.score,
        pros: data.pros,
        cons: data.cons,
        notes: data.notes,
        tags: data.tags || [],
      },
    });

    return updatedInterview;
  }

  /**
   * 更新面试反馈（管理员和HR专用）
   */
  async updateFeedback(id: string, data: InterviewFeedbackDto) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('面试记录不存在');
    }

    // 更新面试记录
    const updatedInterview = await this.prisma.interview.update({
      where: { id },
      data: {
        score: data.score,
        notes: data.notes,
        feedback: {
          pros: data.pros,
          cons: data.cons,
          tags: data.tags || [],
        },
      },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        interviewer: {
          select: { id: true, name: true, email: true, title: true },
        },
      },
    });

    this.logger.log(`Interview feedback updated for interview ${id}`);

    return updatedInterview;
  }

  /**
   * 获取面试统计
   */
  async getStatistics(interviewerId?: string) {
    const where = interviewerId ? { interviewerId } : {};

    const [
      total,
      byStatus,
      byStage,
      upcoming,
      completed,
      avgScore,
    ] = await Promise.all([
      // 总数
      this.prisma.interview.count({ where }),
      // 按状态统计
      this.prisma.interview.groupBy({
        by: ['status'],
        _count: true,
        where,
      }),
      // 按阶段统计
      this.prisma.interview.groupBy({
        by: ['stage'],
        _count: true,
        where,
      }),
      // 即将开始的面试（未来24小时）
      this.prisma.interview.count({
        where: {
          ...where,
          status: InterviewStatus.SCHEDULED,
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
      }),
      // 已完成的面试
      this.prisma.interview.count({
        where: {
          ...where,
          status: InterviewStatus.COMPLETED,
        },
      }),
      // 平均分数（已完成的）
      this.prisma.interview.aggregate({
        where: {
          ...where,
          status: InterviewStatus.COMPLETED,
          score: { not: null },
        },
        _avg: {
          score: true,
        },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      byStage: byStage.map((item) => ({
        stage: item.stage,
        count: item._count,
      })),
      upcoming,
      completed,
      avgScore: avgScore[0]?.avg.score? Math.round(avgScore[0].avg.score * 10) / 10 : 0,
    };
  }

  /**
   * 获取面试官的面试安排
   */
  async getInterviewerSchedule(interviewerId: string, startDate: Date, endDate: Date) {
    const interviews = await this.prisma.interview.findMany({
      where: {
        interviewerId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: InterviewStatus.CANCELLED,
        },
      },
      include: {
        application: {
          include: {
            candidate: { select: { id: true, name: true, avatar: true } },
            job: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return interviews.map((interview) => ({
      id: interview.id,
      title: interview.title,
      scheduledAt: interview.scheduledAt,
      duration: interview.duration,
      candidate: interview.application.candidate,
      job: interview.application.job,
      stage: interview.stage,
      status: interview.status,
    }));
  }
}
