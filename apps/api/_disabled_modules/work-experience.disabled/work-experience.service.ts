import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkExperienceDto, UpdateWorkExperienceDto, QueryWorkExperiencesDto } from './dto';

@Injectable()
export class WorkExperienceService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建工作经历
   */
  async create(dto: CreateWorkExperienceDto) {
    // 验证候选人是否存在
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: dto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    // 如果提供了 companyId，验证公司是否存在
    if (dto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.companyId },
      });

      if (!company) {
        throw new NotFoundException('公司不存在');
      }
    }

    const workExperience = await this.prisma.workExperience.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });

    // 如果是当前工作，更新候选人的当前公司信息
    if (workExperience.isCurrent) {
      await this.updateCandidateCurrentCompany(dto.candidateId, workExperience);
    }

    return workExperience;
  }

  /**
   * 查询工作经历列表
   */
  async findAll(query: QueryWorkExperiencesDto) {
    const { page = 1, limit = 20, candidateId, companyId, companyName, isCurrent, isTargetCompany } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (candidateId) {
      where.candidateId = candidateId;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (companyName) {
      where.companyName = { contains: companyName, mode: 'insensitive' };
    }

    if (isCurrent !== undefined) {
      where.isCurrent = isCurrent;
    }

    if (isTargetCompany !== undefined) {
      where.isTargetCompany = isTargetCompany;
    }

    const [total, data] = await Promise.all([
      this.prisma.workExperience.count({ where }),
      this.prisma.workExperience.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 查询单条工作经历
   */
  async findOne(id: string) {
    const workExperience = await this.prisma.workExperience.findUnique({
      where: { id },
    });

    if (!workExperience) {
      throw new NotFoundException('工作经历不存在');
    }

    return workExperience;
  }

  /**
   * 更新工作经历
   */
  async update(id: string, dto: UpdateWorkExperienceDto) {
    const workExperience = await this.prisma.workExperience.findUnique({
      where: { id },
    });

    if (!workExperience) {
      throw new NotFoundException('工作经历不存在');
    }

    // 如果要更新 companyId，验证公司是否存在
    if (dto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.companyId },
      });

      if (!company) {
        throw new NotFoundException('公司不存在');
      }
    }

    const updated = await this.prisma.workExperience.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });

    // 如果是当前工作，更新候选人的当前公司信息
    if (updated.isCurrent) {
      await this.updateCandidateCurrentCompany(workExperience.candidateId, updated);
    } else if (workExperience.isCurrent && !updated.isCurrent) {
      // 如果从在职变为离职，需要重新计算候选人的当前公司
      await this.recalculateCandidateCurrentCompany(workExperience.candidateId);
    }

    return updated;
  }

  /**
   * 删除工作经历
   */
  async remove(id: string) {
    const workExperience = await this.prisma.workExperience.findUnique({
      where: { id },
    });

    if (!workExperience) {
      throw new NotFoundException('工作经历不存在');
    }

    await this.prisma.workExperience.delete({
      where: { id },
    });

    // 如果删除的是当前工作，需要重新计算候选人的当前公司
    if (workExperience.isCurrent) {
      await this.recalculateCandidateCurrentCompany(workExperience.candidateId);
    }

    return { message: '删除成功' };
  }

  /**
   * 批量创建工作经历
   */
  async createBatch(dtos: CreateWorkExperienceDto[]) {
    if (dtos.length === 0) {
      return [];
    }

    const candidateId = dtos[0].candidateId;

    // 验证候选人是否存在
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    const workExperiences = await Promise.all(
      dtos.map((dto) =>
        this.prisma.workExperience.create({
          data: {
            ...dto,
            startDate: new Date(dto.startDate),
            endDate: dto.endDate ? new Date(dto.endDate) : null,
          },
        }),
      ),
    );

    // 更新候选人的当前公司信息（取最新的在职经历）
    const currentWork = workExperiences.find((w) => w.isCurrent);
    if (currentWork) {
      await this.updateCandidateCurrentCompany(candidateId, currentWork);
    }

    return workExperiences;
  }

  /**
   * 获取候选人的所有工作经历
   */
  async findByCandidate(candidateId: string) {
    return this.prisma.workExperience.findMany({
      where: { candidateId },
      orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
    });
  }

  /**
   * 按公司筛选候选人（核心功能 ⭐）
   */
  async findCandidatesByCompany(companyId: string, includePast: boolean = true) {
    const where: any = {
      companyId,
    };

    if (!includePast) {
      where.isCurrent = true;
    }

    const workExperiences = await this.prisma.workExperience.findMany({
      where,
      include: {
        candidate: true,
      },
    });

    // 返回去重的候选人列表
    const candidates = workExperiences.map((we) => we.candidate);
    const uniqueCandidates = Array.from(
      new Map(candidates.map((c) => [c.id, c])).values(),
    );

    return uniqueCandidates;
  }

  /**
   * 查询在目标公司在职的候选人
   */
  async findCurrentTargetEmployees() {
    const workExperiences = await this.prisma.workExperience.findMany({
      where: {
        isCurrent: true,
        isTargetCompany: true,
      },
      include: {
        candidate: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return workExperiences;
  }

  /**
   * 更新候选人的当前公司信息
   */
  private async updateCandidateCurrentCompany(candidateId: string, workExperience: any) {
    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        currentCompanyId: workExperience.companyId || null,
        currentCompany: workExperience.companyName,
        currentTitle: workExperience.title,
        isCurrentlyEmployed: true,
      },
    });
  }

  /**
   * 重新计算候选人的当前公司信息
   * （当删除或修改当前工作时调用）
   */
  private async recalculateCandidateCurrentCompany(candidateId: string) {
    // 查找最新的在职工作经历
    const currentWork = await this.prisma.workExperience.findFirst({
      where: {
        candidateId,
        isCurrent: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    if (currentWork) {
      await this.updateCandidateCurrentCompany(candidateId, currentWork);
    } else {
      // 没有在职工作，标记为未就业
      await this.prisma.candidate.update({
        where: { id: candidateId },
        data: {
          currentCompanyId: null,
          currentCompany: null,
          currentTitle: null,
          isCurrentlyEmployed: false,
        },
      });
    }
  }
}
