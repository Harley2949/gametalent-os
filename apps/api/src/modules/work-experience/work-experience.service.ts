import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkExperienceDto, UpdateWorkExperienceDto, QueryWorkExperienceDto } from './dto/work-experience.dto';
import { Prisma } from '@gametalent/db';

@Injectable()
export class WorkExperienceService {
  private readonly logger = new Logger(WorkExperienceService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建工作经历
   */
  async create(createDto: CreateWorkExperienceDto) {
    this.logger.log(`创建工作经历: ${createDto.companyName} - ${createDto.title}`);

    // 验证候选人是否存在
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: createDto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`候选人不存在: ${createDto.candidateId}`);
    }

    // 如果提供了 companyId，验证公司是否存在
    if (createDto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: createDto.companyId },
      });

      if (!company) {
        throw new NotFoundException(`公司不存在: ${createDto.companyId}`);
      }
    }

    // 验证日期逻辑
    if (createDto.endDate && createDto.isCurrent) {
      throw new BadRequestException('在职工作经历不能设置结束日期');
    }

    // 创建工作经历
    const workExperience = await this.prisma.workExperience.create({
      data: {
        candidateId: createDto.candidateId,
        companyId: createDto.companyId,
        companyName: createDto.companyName,
        title: createDto.title,
        level: createDto.level,
        department: createDto.department,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
        isCurrent: createDto.isCurrent || false,
        location: createDto.location,
        description: createDto.description,
        achievements: Array.isArray(createDto.achievements)
          ? createDto.achievements.join('\n')
          : createDto.achievements || null,
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
    });

    return workExperience;
  }

  /**
   * 查询所有工作经历
   */
  async findAll(query: QueryWorkExperienceDto) {
    const where: Prisma.WorkExperienceWhereInput = {};

    // 候选人筛选
    if (query.candidateId) {
      where.candidateId = query.candidateId;
    }

    // 公司名称模糊搜索
    if (query.companyName) {
      where.companyName = {
        contains: query.companyName,
        mode: 'insensitive',
      };
    }

    // 职位模糊搜索
    if (query.title) {
      where.title = {
        contains: query.title,
        mode: 'insensitive',
      };
    }

    // 在职状态筛选
    if (query.isCurrent !== undefined) {
      where.isCurrent = query.isCurrent;
    }

    const workExperiences = await this.prisma.workExperience.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { startDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return workExperiences;
  }

  /**
   * 查询单个工作经历
   */
  async findOne(id: string) {
    const workExperience = await this.prisma.workExperience.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!workExperience) {
      throw new NotFoundException(`工作经历不存在: ${id}`);
    }

    return workExperience;
  }

  /**
   * 更新工作经历
   */
  async update(id: string, updateDto: UpdateWorkExperienceDto) {
    this.logger.log(`更新工作经历: ${id}`);

    // 检查是否存在
    await this.findOne(id);

    // 如果提供了 companyId，验证公司是否存在
    if (updateDto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: updateDto.companyId },
      });

      if (!company) {
        throw new NotFoundException(`公司不存在: ${updateDto.companyId}`);
      }
    }

    // 验证日期逻辑
    if (updateDto.endDate && updateDto.isCurrent) {
      throw new BadRequestException('在职工作经历不能设置结束日期');
    }

    const workExperience = await this.prisma.workExperience.update({
      where: { id },
      data: {
        ...(updateDto.companyName !== undefined && { companyName: updateDto.companyName }),
        ...(updateDto.title !== undefined && { title: updateDto.title }),
        ...(updateDto.level !== undefined && { level: updateDto.level }),
        ...(updateDto.department !== undefined && { department: updateDto.department }),
        ...(updateDto.startDate !== undefined && { startDate: new Date(updateDto.startDate) }),
        ...(updateDto.endDate !== undefined && { endDate: updateDto.endDate ? new Date(updateDto.endDate) : null }),
        ...(updateDto.isCurrent !== undefined && { isCurrent: updateDto.isCurrent }),
        ...(updateDto.location !== undefined && { location: updateDto.location }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
        ...(updateDto.achievements !== undefined && {
          achievements: Array.isArray(updateDto.achievements)
            ? updateDto.achievements.join('\n')
            : updateDto.achievements
        }),
        ...(updateDto.teamSize !== undefined && { teamSize: updateDto.teamSize }),
        ...(updateDto.directReports !== undefined && { directReports: updateDto.directReports }),
        ...(updateDto.leaveReason !== undefined && { leaveReason: updateDto.leaveReason }),
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
    });

    return workExperience;
  }

  /**
   * 删除工作经历
   */
  async remove(id: string) {
    this.logger.log(`删除工作经历: ${id}`);

    // 检查是否存在
    await this.findOne(id);

    await this.prisma.workExperience.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }

  /**
   * 获取候选人的所有工作经历
   */
  async findByCandidate(candidateId: string) {
    const workExperiences = await this.prisma.workExperience.findMany({
      where: { candidateId },
      orderBy: [
        { startDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return workExperiences;
  }

  /**
   * 批量创建工作经历
   */
  async batchCreate(candidateId: string, createDtos: CreateWorkExperienceDto[]) {
    this.logger.log(`批量创建工作经历: ${createDtos.length} 条`);

    // 验证候选人是否存在
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`候选人不存在: ${candidateId}`);
    }

    // 验证所有公司ID（如果提供）
    for (const dto of createDtos) {
      if (dto.companyId) {
        const company = await this.prisma.company.findUnique({
          where: { id: dto.companyId },
        });

        if (!company) {
          throw new NotFoundException(`公司不存在: ${dto.companyId}`);
        }
      }
    }

    const workExperiences = await this.prisma.workExperience.createMany({
      data: createDtos.map((dto) => ({
        candidateId,
        companyId: dto.companyId,
        companyName: dto.companyName,
        title: dto.title,
        level: dto.level,
        department: dto.department,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isCurrent: dto.isCurrent || false,
        location: dto.location,
        description: dto.description,
        achievements: Array.isArray(dto.achievements)
          ? dto.achievements.join('\n')
          : dto.achievements || null,
        teamSize: dto.teamSize,
        directReports: dto.directReports,
        leaveReason: dto.leaveReason,
      })),
    });

    return {
      count: workExperiences.count,
      message: `成功创建 ${workExperiences.count} 条工作经历`,
    };
  }

  /**
   * 按技能搜索工作经历
   * 注意：WorkExperience 模型没有 skills 字段，此方法已禁用
   * 请使用 Resume 的技能提取功能或其他方式查找技能相关的工作经历
   */
  async findBySkill(skill: string) {
    throw new BadRequestException('WorkExperience 模型不支持按技能搜索，请使用 Resume 技能提取功能');
  }
}
