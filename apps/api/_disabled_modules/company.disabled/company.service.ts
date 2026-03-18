import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, QueryCompaniesDto } from './dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建公司
   */
  async create(dto: CreateCompanyDto) {
    // 检查公司名称是否已存在
    const existingCompany = await this.prisma.company.findUnique({
      where: { name: dto.name },
    });

    if (existingCompany) {
      throw new ConflictException('公司名称已存在');
    }

    return this.prisma.company.create({
      data: dto,
    });
  }

  /**
   * 查询公司列表
   */
  async findAll(query: QueryCompaniesDto) {
    const { page = 1, limit = 20, name, type, scale, country, isCompetitor } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (name) {
      where.OR = [
        { name: { contains: name, mode: 'insensitive' } },
        { nameEn: { contains: name, mode: 'insensitive' } },
        { aliases: { has: name } },
        { shortName: { contains: name, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (scale) {
      where.scale = scale;
    }

    if (country) {
      where.country = country;
    }

    if (isCompetitor !== undefined) {
      where.isCompetitor = isCompetitor;
    }

    const [total, data] = await Promise.all([
      this.prisma.company.count({ where }),
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
   * 查询单条公司
   */
  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('公司不存在');
    }

    return company;
  }

  /**
   * 根据别名查找公司（用于模糊匹配）
   */
  async findByAlias(alias: string) {
    return this.prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: alias, mode: 'insensitive' } },
          { nameEn: { contains: alias, mode: 'insensitive' } },
          { aliases: { has: alias } },
          { shortName: { contains: alias, mode: 'insensitive' } },
        ],
        isActive: true,
      },
    });
  }

  /**
   * 更新公司信息
   */
  async update(id: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('公司不存在');
    }

    // 如果要更新名称，检查是否与其他公司冲突
    if (dto.name && dto.name !== company.name) {
      const existingCompany = await this.prisma.company.findUnique({
        where: { name: dto.name },
      });

      if (existingCompany) {
        throw new ConflictException('公司名称已存在');
      }
    }

    return this.prisma.company.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除公司
   */
  async remove(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('公司不存在');
    }

    // 检查是否有工作经历关联
    const workExperiencesCount = await this.prisma.workExperience.count({
      where: { companyId: id },
    });

    if (workExperiencesCount > 0) {
      throw new ConflictException('该公司有关联的工作经历，无法删除');
    }

    await this.prisma.company.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }

  /**
   * 获取所有竞争对手公司
   */
  async findCompetitors() {
    return this.prisma.company.findMany({
      where: {
        isCompetitor: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * 按类型获取公司列表
   */
  async findByType(type: string) {
    return this.prisma.company.findMany({
      where: {
        type: type as any,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * 搜索公司（用于工作经历的公司自动匹配）
   */
  async search(keyword: string) {
    return this.prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { nameEn: { contains: keyword, mode: 'insensitive' } },
          { aliases: { has: keyword } },
          { shortName: { contains: keyword, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      take: 10,
    });
  }

  /**
   * 批量导入公司数据
   */
  async importCompanies(companies: CreateCompanyDto[]) {
    const results = {
      success: [],
      failed: [],
    };

    for (const companyDto of companies) {
      try {
        // 检查是否已存在
        const existing = await this.prisma.company.findUnique({
          where: { name: companyDto.name },
        });

        if (existing) {
          // 更新现有公司
          await this.prisma.company.update({
            where: { id: existing.id },
            data: companyDto,
          });
          results.success.push({ action: 'updated', company: companyDto.name });
        } else {
          // 创建新公司
          await this.prisma.company.create({
            data: companyDto,
          });
          results.success.push({ action: 'created', company: companyDto.name });
        }
      } catch (error) {
        results.failed.push({ company: companyDto.name, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return results;
  }
}
