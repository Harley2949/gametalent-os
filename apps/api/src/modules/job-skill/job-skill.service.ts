import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobSkillDto, UpdateJobSkillDto, QueryJobSkillsDto } from './dto';

@Injectable()
export class JobSkillService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建职位技能要求
   */
  async create(dto: CreateJobSkillDto) {
    // 验证职位是否存在
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    return this.prisma.jobSkill.create({
      data: dto,
    });
  }

  /**
   * 查询职位技能要求列表
   */
  async findAll(query: QueryJobSkillsDto) {
    const { page = 1, limit = 20, jobId, category, importance } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (jobId) {
      where.jobId = jobId;
    }

    if (category) {
      where.category = category;
    }

    if (importance) {
      where.importance = importance;
    }

    const [total, data] = await Promise.all([
      this.prisma.jobSkill.count({ where }),
      this.prisma.jobSkill.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ importance: 'desc' }, { name: 'asc' }],
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
   * 查询单条职位技能要求
   */
  async findOne(id: string) {
    const jobSkill = await this.prisma.jobSkill.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
      },
    });

    if (!jobSkill) {
      throw new NotFoundException('职位技能要求不存在');
    }

    return jobSkill;
  }

  /**
   * 更新职位技能要求
   */
  async update(id: string, dto: UpdateJobSkillDto) {
    const jobSkill = await this.prisma.jobSkill.findUnique({
      where: { id },
    });

    if (!jobSkill) {
      throw new NotFoundException('职位技能要求不存在');
    }

    return this.prisma.jobSkill.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除职位技能要求
   */
  async remove(id: string) {
    const jobSkill = await this.prisma.jobSkill.findUnique({
      where: { id },
    });

    if (!jobSkill) {
      throw new NotFoundException('职位技能要求不存在');
    }

    await this.prisma.jobSkill.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }

  /**
   * 批量创建职位技能要求
   */
  async createBatch(jobId: string, skills: Omit<CreateJobSkillDto, 'jobId'>[]) {
    // 验证职位是否存在
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    const jobSkills = await Promise.all(
      skills.map((skill) =>
        this.prisma.jobSkill.create({
          data: {
            jobId,
            ...skill,
          },
        }),
      ),
    );

    return jobSkills;
  }

  /**
   * 获取职位的所有技能要求
   */
  async findByJob(jobId: string) {
    return this.prisma.jobSkill.findMany({
      where: { jobId },
      orderBy: [{ importance: 'desc' }, { name: 'asc' }],
    });
  }

  /**
   * 删除职位的所有技能要求
   */
  async removeByJob(jobId: string) {
    await this.prisma.jobSkill.deleteMany({
      where: { jobId },
    });

    return { message: '删除成功', count: 0 };
  }
}
