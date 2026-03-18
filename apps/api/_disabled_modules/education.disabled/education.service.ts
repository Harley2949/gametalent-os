import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEducationDto, UpdateEducationDto, QueryEducationsDto } from './dto';
import { SchoolType } from '@prisma/client';

@Injectable()
export class EducationService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建教育经历
   */
  async create(candidateId: string, dto: CreateEducationDto) {
    // 验证候选人是否存在
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    const education = await this.prisma.education.create({
      data: {
        candidateId,
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });

    // 更新候选人的最高学历信息
    await this.updateCandidateEducation(candidateId);

    return education;
  }

  /**
   * 查询教育经历列表
   */
  async findAll(query: QueryEducationsDto) {
    const { page = 1, limit = 20, candidateId, school, schoolType, level, isOverseas, qsRankingMax } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (candidateId) {
      where.candidateId = candidateId;
    }

    if (school) {
      where.school = { contains: school, mode: 'insensitive' };
    }

    if (schoolType) {
      where.schoolType = schoolType;
    }

    if (level) {
      where.level = level;
    }

    if (isOverseas !== undefined) {
      where.isOverseas = isOverseas;
    }

    if (qsRankingMax !== undefined) {
      where.qsRanking = { lte: qsRankingMax };
    }

    const [total, data] = await Promise.all([
      this.prisma.education.count({ where }),
      this.prisma.education.findMany({
        where,
        skip,
        take: limit,
        orderBy: { graduationYear: 'desc' },
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
   * 查询单条教育经历
   */
  async findOne(id: string) {
    const education = await this.prisma.education.findUnique({
      where: { id },
    });

    if (!education) {
      throw new NotFoundException('教育经历不存在');
    }

    return education;
  }

  /**
   * 更新教育经历
   */
  async update(id: string, dto: UpdateEducationDto) {
    const education = await this.prisma.education.findUnique({
      where: { id },
    });

    if (!education) {
      throw new NotFoundException('教育经历不存在');
    }

    const updated = await this.prisma.education.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });

    // 如果学历等级变化，更新候选人的最高学历
    if (dto.level && dto.level !== education.level) {
      await this.updateCandidateEducation(education.candidateId);
    }

    return updated;
  }

  /**
   * 删除教育经历
   */
  async remove(id: string) {
    const education = await this.prisma.education.findUnique({
      where: { id },
    });

    if (!education) {
      throw new NotFoundException('教育经历不存在');
    }

    await this.prisma.education.delete({
      where: { id },
    });

    // 重新计算候选人的最高学历
    await this.updateCandidateEducation(education.candidateId);

    return { message: '删除成功' };
  }

  /**
   * 批量创建教育经历
   */
  async createBatch(candidateId: string, dtos: CreateEducationDto[]) {
    // 验证候选人是否存在
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    const educations = await Promise.all(
      dtos.map((dto) =>
        this.prisma.education.create({
          data: {
            candidateId,
            ...dto,
            startDate: dto.startDate ? new Date(dto.startDate) : null,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
          },
        }),
      ),
    );

    // 更新候选人的最高学历信息
    await this.updateCandidateEducation(candidateId);

    return educations;
  }

  /**
   * 更新候选人的最高学历信息
   * （根据所有教育经历自动计算）
   */
  private async updateCandidateEducation(candidateId: string) {
    const educations = await this.prisma.education.findMany({
      where: { candidateId },
      orderBy: { level: 'desc' },
    });

    if (educations.length === 0) {
      return;
    }

    // 找到最高学历
    const highestEducation = educations[0];

    // 更新候选人的最高学历字段
    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        educationLevel: highestEducation.level,
        school: highestEducation.school,
        schoolType: highestEducation.schoolType,
        major: highestEducation.major,
        graduationYear: highestEducation.graduationYear,
        isOverseasEducation: highestEducation.isOverseas,
      },
    });
  }

  /**
   * 获取候选人的教育经历
   */
  async findByCandidate(candidateId: string) {
    return this.prisma.education.findMany({
      where: { candidateId },
      orderBy: { graduationYear: 'desc' },
    });
  }

  /**
   * 按学校筛选候选人（用于公司筛选功能）
   */
  async findCandidatesBySchool(schoolType?: SchoolType, qsRankingMax?: number) {
    const where: any = {};

    if (schoolType) {
      where.schoolType = schoolType;
    }

    if (qsRankingMax !== undefined) {
      where.qsRanking = { lte: qsRankingMax };
    }

    const educations = await this.prisma.education.findMany({
      where,
      include: {
        candidate: true,
      },
    });

    // 返回去重的候选人列表
    const candidates = educations.map((edu) => edu.candidate);
    const uniqueCandidates = Array.from(
      new Map(candidates.map((c) => [c.id, c])).values(),
    );

    return uniqueCandidates;
  }
}
