import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CandidateSource, CandidateStatus } from '@prisma/client';
import { CreateCandidateDto, UpdateCandidateDto, QueryCandidatesDto } from './dto';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取候选人列表（支持搜索、筛选、分页）
   */
  async findAll(query: QueryCandidatesDto) {
    const { skip = 0, take = 10, search, status, source, tags, company, skill } = query;

    // 构建查询条件
    const where: any = {};

    // 搜索：姓名、邮箱、公司、职位
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { currentCompany: { contains: search, mode: 'insensitive' } },
        { currentTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 来源筛选
    if (source) {
      where.source = source;
    }

    // 标签筛选（包含任一标签）
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    // 公司筛选
    if (company) {
      where.currentCompany = {
        contains: company,
        mode: 'insensitive',
      };
    }

    // 技能筛选（通过简历中的技能标签）
    if (skill) {
      where.resumes = {
        some: {
          skills: {
            has: skill,
          },
        },
      };
    }

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: {
              resumes: true,
              applications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      data: candidates,
      meta: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }

  /**
   * 获取候选人详情（包含简历和应聘记录）
   */
  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        resumes: {
          orderBy: { createdAt: 'desc' },
        },
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                status: true,
                department: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    return {
      success: true,
      message: '获取成功',
      data: candidate,
    };
  }

  /**
   * 创建候选人
   */
  async create(data: CreateCandidateDto) {
    // 检查邮箱是否已存在
    const existing = await this.prisma.candidate.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException('该邮箱已被使用');
    }

    return this.prisma.candidate.create({
      data: {
        ...data,
        source: data.source || CandidateSource.OTHER,
        status: CandidateStatus.ACTIVE,
        tags: data.tags || [],
      },
    });
  }

  /**
   * 更新候选人信息
   */
  async update(id: string, data: UpdateCandidateDto) {
    // 检查候选人是否存在
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    // 如果更新邮箱，检查新邮箱是否已被使用
    if (data.email && data.email !== candidate.email) {
      const existing = await this.prisma.candidate.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new ConflictException('该邮箱已被使用');
      }
    }

    const updatedCandidate = await this.prisma.candidate.update({
      where: { id },
      data: data as any, // 类型断言修复 Prisma 类型检查问题
    });

    return updatedCandidate;
  }

  /**
   * 删除候选人（软删除）
   */
  async remove(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    // 软删除：将状态设为 ARCHIVED
    return this.prisma.candidate.update({
      where: { id },
      data: {
        status: CandidateStatus.ARCHIVED,
      },
    });
  }

  /**
   * 永久删除候选人
   */
  async permanentlyDelete(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    return this.prisma.candidate.delete({
      where: { id },
    });
  }

  /**
   * 添加标签
   */
  async addTags(id: string, tags: string[]) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      select: { tags: true },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    const existingTags = candidate.tags || [];
    const newTags = [...new Set([...existingTags, ...tags])];

    return this.prisma.candidate.update({
      where: { id },
      data: {
        tags: newTags,
      },
    });
  }

  /**
   * 移除标签
   */
  async removeTags(id: string, tags: string[]) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      select: { tags: true },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    const existingTags = candidate.tags || [];
    const newTags = existingTags.filter(tag => !tags.includes(tag));

    return this.prisma.candidate.update({
      where: { id },
      data: {
        tags: newTags,
      },
    });
  }

  /**
   * 更新状态
   */
  async updateStatus(id: string, status: CandidateStatus) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    return this.prisma.candidate.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * 获取所有标签（数据库聚合优化版本 + 增强功能）
   *
   * 使用 PostgreSQL 的 unnest 函数在数据库层面完成聚合
   * 性能最优：只返回聚合后的结果，数据传输量最小
   *
   * @param options - 查询选项
   * @param options.limit - 返回标签数量限制（默认100）
   * @param options.minCount - 最小出现次数（默认1）
   * @param options.excludeArchived - 是否排除已归档候选人（默认true）
   * @returns 标签列表，按使用次数降序排列
   */
  async getAllTags(options?: {
    limit?: number;
    minCount?: number;
    excludeArchived?: boolean;
  }) {
    const {
      limit = 100,
      minCount = 1,
      excludeArchived = true,
    } = options || {};

    // 构建动态 SQL 查询
    const whereConditions: string[] = ['cardinality(tags) > 0'];

    // 可选：排除已归档的候选人
    if (excludeArchived) {
      whereConditions.push("status != 'ARCHIVED'");
    }

    const whereClause = whereConditions.join(' AND ');

    const result = await this.prisma.$queryRaw<Array<{ tag: string; count: bigint }>>`
      SELECT
        unnest(tags) AS tag,
        COUNT(*) AS count
      FROM candidates
      WHERE ${Prisma.raw(whereClause)}
      GROUP BY tag
      HAVING COUNT(*) >= ${minCount}
      ORDER BY count DESC, tag ASC
      LIMIT ${limit}
    `;

    return result.map(({ tag, count }) => ({
      tag,
      count: Number(count),
    }));
  }

  /**
   * 上传简历
   */
  async uploadResume(
    id: string,
    fileData: {
      fileName: string;
      fileUrl: string;
      fileSize: number;
      fileType: string;
    },
    title?: string,
    isPrimary = false,
  ) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    // 如果设置为主简历，取消其他简历的主状态
    if (isPrimary) {
      await this.prisma.resume.updateMany({
        where: { candidateId: id },
        data: { isPrimary: false },
      });
    }

    return this.prisma.resume.create({
      data: {
        candidateId: id,
        title: title || fileData.fileName,
        fileName: fileData.fileName,
        fileUrl: fileData.fileUrl,
        fileSize: fileData.fileSize,
        fileType: fileData.fileType,
        isPrimary,
        status: 'PARSING',
      },
    });
  }

  /**
   * 批量导入候选人
   */
  async batchImport(candidates: CreateCandidateDto[]) {
    const results = {
      success: [] as string[],
      failed: [] as { email: string; reason: string }[],
      total: candidates.length,
    };

    for (const candidateData of candidates) {
      try {
        await this.create(candidateData);
        results.success.push(candidateData.email);
      } catch (error) {
        results.failed.push({
          email: candidateData.email,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  /**
   * 获取候选人统计
   */
  async getStatistics() {
    const [
      total,
      byStatus,
      bySource,
      recentAdded,
      totalResumes,
    ] = await Promise.all([
      // 总数
      this.prisma.candidate.count({
        where: {
          status: {
            not: CandidateStatus.ARCHIVED,
          },
        },
      }),
      // 按状态统计
      this.prisma.candidate.groupBy({
        by: ['status'],
        _count: true,
      }),
      // 按来源统计
      this.prisma.candidate.groupBy({
        by: ['source'],
        _count: true,
      }),
      // 最近添加（7天内）
      this.prisma.candidate.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // 简历总数
      this.prisma.resume.count(),
    ]);

    return {
      total,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count,
      })),
      bySource: bySource.map(item => ({
        source: item.source,
        count: item._count,
      })),
      recentAdded,
      totalResumes,
    };
  }

  /**
   * 获取候选人阶段变更历史
   */
  async getStageHistory(candidateId: string) {
    // 首先检查候选人是否存在
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        name: true,
        stage: true,
      },
    });

    if (!candidate) {
      return {
        success: false,
        message: '候选人不存在',
        data: null,
      };
    }

    // 获取阶段变更历史记录
    const history = await this.prisma.candidateStageHistory.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
      take: 50, // 最多返回50条记录
    });

    // 将数据库枚举值映射为中文显示名称
    const stageNameMap: Record<string, string> = {
      INITIAL_SCREENING: '初筛',
      INTERVIEW: '面试',
      OFFER: 'Offer',
      ONBOARDING: '入职',
      HIRED: '已入职',
      REJECTED: '淘汰',
    };

    // 转换历史记录格式
    const formattedHistory = history.map((entry) => ({
      id: entry.id,
      fromStage: entry.fromStage ? stageNameMap[entry.fromStage] || entry.fromStage : null,
      toStage: stageNameMap[entry.toStage] || entry.toStage,
      changedBy: entry.changedBy,
      changeReason: entry.changeReason,
      changeType: entry.changeType, // MANUAL 或 AUTOMATIC
      createdAt: entry.createdAt,
    }));

    return {
      success: true,
      message: '获取成功',
      data: {
        candidate: {
          id: candidate.id,
          name: candidate.name,
          currentStage: stageNameMap[candidate.stage] || candidate.stage,
        },
        history: formattedHistory,
      },
    };
  }

  /**
   * 记录候选人阶段变更历史
   */
  async recordStageChange(
    candidateId: string,
    fromStage: any,
    toStage: any,
    changedBy: string | null = null,
    changeReason: string | null = null,
    changeType: 'MANUAL' | 'AUTOMATIC' = 'MANUAL',
  ) {
    await this.prisma.candidateStageHistory.create({
      data: {
        candidateId,
        fromStage,
        toStage,
        changedBy,
        changeReason,
        changeType,
      },
    });
  }

  /**
   * 生成 CUID（用于 ID）
   * 简单实现，实际应使用 cuid 库
   */
  private cuid(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${timestamp}${random}`;
  }
}
