import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEducationDto, UpdateEducationDto, QueryEducationDto } from './dto/education.dto';
import { Prisma } from '@gametalent/db';

@Injectable()
export class EducationService {
  private readonly logger = new Logger(EducationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建教育经历
   */
  async create(createDto: CreateEducationDto) {
    this.logger.log(`创建教育经历: ${createDto.school} - ${createDto.major}`);

    // 验证候选人是否存在
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: createDto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`候选人不存在: ${createDto.candidateId}`);
    }

    // 创建教育经历
    const education = await this.prisma.education.create({
      data: {
        candidateId: createDto.candidateId,
        school: createDto.school,
        schoolType: createDto.schoolType,
        major: createDto.major,
        degree: createDto.degree,
        level: createDto.level,
        isOverseas: createDto.isOverseas || false,
        qsRanking: createDto.qsRanking,
        startDate: createDto.startDate ? new Date(createDto.startDate) : null,
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
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

    return education;
  }

  /**
   * 查询所有教育经历
   */
  async findAll(query: QueryEducationDto) {
    const where: Prisma.EducationWhereInput = {};

    // 候选人筛选
    if (query.candidateId) {
      where.candidateId = query.candidateId;
    }

    // 学校名称模糊搜索
    if (query.school) {
      where.school = {
        contains: query.school,
        mode: 'insensitive',
      };
    }

    // 学历层次筛选
    if (query.level) {
      where.level = query.level;
    }

    // 海外学历筛选
    if (query.isOverseas !== undefined) {
      where.isOverseas = query.isOverseas;
    }

    // 专业模糊搜索
    if (query.major) {
      where.major = {
        contains: query.major,
        mode: 'insensitive',
      };
    }

    const educations = await this.prisma.education.findMany({
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

    return educations;
  }

  /**
   * 查询单个教育经历
   */
  async findOne(id: string) {
    const education = await this.prisma.education.findUnique({
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

    if (!education) {
      throw new NotFoundException(`教育经历不存在: ${id}`);
    }

    return education;
  }

  /**
   * 更新教育经历
   */
  async update(id: string, updateDto: UpdateEducationDto) {
    this.logger.log(`更新教育经历: ${id}`);

    // 检查是否存在
    await this.findOne(id);

    const education = await this.prisma.education.update({
      where: { id },
      data: {
        ...(updateDto.school !== undefined && { school: updateDto.school }),
        ...(updateDto.schoolType !== undefined && { schoolType: updateDto.schoolType }),
        ...(updateDto.country !== undefined && { country: updateDto.country }),
        ...(updateDto.province !== undefined && { province: updateDto.province }),
        ...(updateDto.city !== undefined && { city: updateDto.city }),
        ...(updateDto.major !== undefined && { major: updateDto.major }),
        ...(updateDto.degree !== undefined && { degree: updateDto.degree }),
        ...(updateDto.level !== undefined && { level: updateDto.level }),
        ...(updateDto.isOverseas !== undefined && { isOverseas: updateDto.isOverseas }),
        ...(updateDto.qsRanking !== undefined && { qsRanking: updateDto.qsRanking }),
        ...(updateDto.theRanking !== undefined && { theRanking: updateDto.theRanking }),
        ...(updateDto.arwuRanking !== undefined && { arwuRanking: updateDto.arwuRanking }),
        ...(updateDto.startDate !== undefined && { startDate: new Date(updateDto.startDate) }),
        ...(updateDto.endDate !== undefined && { endDate: updateDto.endDate ? new Date(updateDto.endDate) : null }),
        ...(updateDto.gpa !== undefined && { gpa: updateDto.gpa }),
        ...(updateDto.honors !== undefined && { honors: updateDto.honors }),
        ...(updateDto.courses !== undefined && { courses: updateDto.courses }),
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

    return education;
  }

  /**
   * 删除教育经历
   */
  async remove(id: string) {
    this.logger.log(`删除教育经历: ${id}`);

    // 检查是否存在
    await this.findOne(id);

    await this.prisma.education.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }

  /**
   * 获取候选人的所有教育经历
   */
  async findByCandidate(candidateId: string) {
    const educations = await this.prisma.education.findMany({
      where: { candidateId },
      orderBy: [
        { startDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return educations;
  }

  /**
   * 批量创建教育经历
   */
  async batchCreate(candidateId: string, createDtos: CreateEducationDto[]) {
    this.logger.log(`批量创建教育经历: ${createDtos.length} 条`);

    // 验证候选人是否存在
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`候选人不存在: ${candidateId}`);
    }

    const educations = await this.prisma.education.createMany({
      data: createDtos.map((dto) => ({
        candidateId,
        school: dto.school,
        schoolType: dto.schoolType,
        country: dto.country,
        province: dto.province,
        city: dto.city,
        major: dto.major,
        degree: dto.degree,
        level: dto.level,
        isOverseas: dto.isOverseas || false,
        qsRanking: dto.qsRanking,
        theRanking: dto.theRanking,
        arwuRanking: dto.arwuRanking,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        gpa: dto.gpa,
        honors: dto.honors || [],
        courses: dto.courses || [],
      })),
    });

    return {
      count: educations.count,
      message: `成功创建 ${educations.count} 条教育经历`,
    };
  }
}
