import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateJobMatchDto,
  UpdateJobMatchDto,
  QueryJobMatchesDto,
  TriggerJobMatchingDto,
} from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobMatchService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建匹配记录
   */
  async create(dto: CreateJobMatchDto) {
    // 验证职位和候选人是否存在
    const [job, candidate] = await Promise.all([
      this.prisma.job.findUnique({ where: { id: dto.jobId } }),
      this.prisma.candidate.findUnique({ where: { id: dto.candidateId } }),
    ]);

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    // 检查是否已存在匹配记录
    const existing = await this.prisma.jobMatch.findUnique({
      where: {
        jobId_candidateId: {
          jobId: dto.jobId,
          candidateId: dto.candidateId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('该候选人已与该职位进行匹配');
    }

    return this.prisma.jobMatch.create({
      data: {
        ...dto,
        status: dto.status || 'PENDING',
      },
    });
  }

  /**
   * 查询匹配记录列表
   */
  async findAll(query: QueryJobMatchesDto) {
    const { page = 1, limit = 20, jobId, candidateId, status, minScore, maxScore } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (jobId) {
      where.jobId = jobId;
    }

    if (candidateId) {
      where.candidateId = candidateId;
    }

    if (status) {
      where.status = status;
    }

    if (minScore !== undefined || maxScore !== undefined) {
      where.overallScore = {};
      if (minScore !== undefined) {
        where.overallScore.gte = minScore;
      }
      if (maxScore !== undefined) {
        where.overallScore.lte = maxScore;
      }
    }

    const [total, data] = await Promise.all([
      this.prisma.jobMatch.count({ where }),
      this.prisma.jobMatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ overallScore: 'desc' }, { createdAt: 'desc' }],
        include: {
          job: {
            select: {
              id: true,
              title: true,
              department: true,
              experienceLevel: true,
            },
          },
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              currentCompany: true,
              currentTitle: true,
              yearsOfExperience: true,
              educationLevel: true,
            },
          },
        },
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
   * 查询单条匹配记录
   */
  async findOne(id: string) {
    const jobMatch = await this.prisma.jobMatch.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: true,
      },
    });

    if (!jobMatch) {
      throw new NotFoundException('匹配记录不存在');
    }

    return jobMatch;
  }

  /**
   * 更新匹配记录
   */
  async update(id: string, dto: UpdateJobMatchDto) {
    const jobMatch = await this.prisma.jobMatch.findUnique({
      where: { id },
    });

    if (!jobMatch) {
      throw new NotFoundException('匹配记录不存在');
    }

    const data: any = { ...dto };

    if (dto.contactedAt !== undefined) {
      data.contactedAt = dto.contactedAt ? new Date() : null;
    }

    const updated = await this.prisma.jobMatch.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * 删除匹配记录
   */
  async remove(id: string) {
    const jobMatch = await this.prisma.jobMatch.findUnique({
      where: { id },
    });

    if (!jobMatch) {
      throw new NotFoundException('匹配记录不存在');
    }

    await this.prisma.jobMatch.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }

  /**
   * 触发 AI 匹配计算（核心功能 ⭐）
   */
  async triggerMatching(dto: TriggerJobMatchingDto) {
    const { jobId, candidateId, recalculate = false } = dto;

    // 验证职位是否存在
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        requiredSkills: true,
        matchWeights: true,
      },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    // 获取需要匹配的候选人列表
    let candidateIds: string[] = [];

    if (candidateId) {
      // 匹配指定候选人
      candidateIds = [candidateId];
    } else {
      // 匹配所有候选人（排除已存在的匹配，除非 recalculate=true）
      const existingMatches = recalculate
        ? []
        : await this.prisma.jobMatch.findMany({
            where: { jobId },
            select: { candidateId: true },
          });

      const excludedIds = existingMatches.map((m) => m.candidateId);

      // 获取活跃候选人
      const candidates = await this.prisma.candidate.findMany({
        where: {
          id: { notIn: excludedIds },
          status: 'ACTIVE',
        },
        select: { id: true },
        take: 100, // 限制数量避免计算量过大
      });

      candidateIds = candidates.map((c) => c.id);
    }

    // 为每个候选人执行匹配计算
    const results = [];
    for (const cid of candidateIds) {
      const matchScore = await this.calculateMatchScore(jobId, cid);

      if (matchScore) {
        results.push(matchScore);
      }
    }

    // 批量创建/更新匹配记录
    const matches = await Promise.all(
      results.map((result) =>
        this.upsertMatch(result.jobId, result.candidateId, result),
      ),
    );

    return {
      jobId,
      total: matches.length,
      matches: matches.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0)),
    };
  }

  /**
   * 计算单个候选人的匹配分数
   */
  private async calculateMatchScore(jobId: string, candidateId: string) {
    // 并行获取职位和候选人信息
    const [job, candidate, resume] = await Promise.all([
      this.prisma.job.findUnique({
        where: { id: jobId },
        include: {
          requiredSkills: true,
          matchWeights: true,
        },
      }),
      this.prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          educations: true,
          workExperiences: {
            orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
            take: 5,
          },
        },
      }),
      this.prisma.resume.findFirst({
        where: { candidateId, isPrimary: true },
        include: {
          extractedSkills: true,
          projectExperiences: true,
        },
      }),
    ]);

    if (!job || !candidate) {
      return null;
    }

    // 获取权重配置
    const weights = job.matchWeights || this.getDefaultWeights();

    // 计算各维度分数
    const skillScore = await this.calculateSkillMatch(job, resume, weights);
    const projectScore = this.calculateProjectMatch(job, resume, weights);
    const educationScore = await this.calculateEducationMatch(job, candidate, weights);
    const experienceScore = this.calculateExperienceMatch(job, candidate, weights);
    const ageScore = this.calculateAgeMatch(job, candidate, weights);
    const companyScore = await this.calculateCompanyMatch(job, candidate, weights);

    // 计算总分
    const overallScore =
      skillScore * weights.skillWeight +
      projectScore * weights.projectWeight +
      educationScore * weights.educationWeight +
      experienceScore * weights.experienceWeight +
      ageScore * weights.ageWeight +
      companyScore * weights.companyBackgroundWeight;

    return {
      jobId,
      candidateId,
      resumeId: resume?.id,
      status: 'PENDING',
      overallScore: Math.round(overallScore),
      skillScore: Math.round(skillScore),
      projectScore: Math.round(projectScore),
      educationScore: Math.round(educationScore),
      experienceScore: Math.round(experienceScore),
      ageScore: Math.round(ageScore),
      companyBackgroundScore: Math.round(companyScore),
      // TODO: 添加详细信息的 JSON 结构
    };
  }

  /**
   * 计算技能匹配分数
   */
  private async calculateSkillMatch(job: any, resume: any, weights: any): Promise<number> {
    if (!resume) return 0;

    const requiredSkills = job.requiredSkills || [];
    const candidateSkills = resume.extractedSkills || [];

    if (requiredSkills.length === 0) {
      return 70; // 没有技能要求时给一个基础分
    }

    let totalScore = 0;
    let weightedSum = 0;

    for (const requiredSkill of requiredSkills) {
      const weight = requiredSkill.importance === 'MUST_HAVE' ? 1 : 0.5;
      weightedSum += weight;

      // 查找候选人是否有该技能
      const candidateSkill = candidateSkills.find(
        (cs: any) => cs.name === requiredSkill.name,
      );

      if (candidateSkill) {
        // 根据熟练度评分
        const proficiencyScores = {
          BEGINNER: 40,
          INTERMEDIATE: 70,
          ADVANCED: 90,
          EXPERT: 100,
        };

        const score = proficiencyScores[candidateSkill.proficiency] || 70;

        // 如果有最低熟练度要求
        if (
          requiredSkill.minProficiency &&
          this.compareProficiency(
            candidateSkill.proficiency,
            requiredSkill.minProficiency,
          ) < 0
        ) {
          // 不满足最低要求，扣分
          totalScore += score * 0.5 * weight;
        } else {
          totalScore += score * weight;
        }
      }
    }

    return weightedSum > 0 ? (totalScore / weightedSum) * 100 : 0;
  }

  /**
   * 计算项目经验匹配分数
   */
  private calculateProjectMatch(job: any, resume: any, weights: any): number {
    if (!resume) return 0;

    const projects = resume.projectExperiences || [];
    const jobGenres = job.gameGenres || [];
    const jobPlatforms = job.platforms || [];

    if (jobGenres.length === 0 && jobPlatforms.length === 0) {
      return 70; // 没有特定要求时给基础分
    }

    let totalScore = 0;
    let count = 0;

    for (const project of projects) {
      let score = 60; // 基础分

      // 游戏类型匹配
      if (jobGenres.length > 0 && project.gameGenre) {
        if (jobGenres.includes(project.gameGenre)) {
          score += 20;
        }
      }

      // 平台匹配
      if (jobPlatforms.length > 0 && project.platform?.length > 0) {
        const hasPlatform = project.platform.some((p: any) =>
          jobPlatforms.includes(p),
        );
        if (hasPlatform) {
          score += 20;
        }
      }

      // 是否是项目负责人（加分）
      if (project.isLead) {
        score += 10;
      }

      totalScore += score;
      count++;
    }

    return count > 0 ? Math.min(totalScore / count, 100) : 0;
  }

  /**
   * 计算学历匹配分数
   */
  private async calculateEducationMatch(
    job: any,
    candidate: any,
    weights: any,
  ): Promise<number> {
    const educationLevel = candidate.educationLevel;
    const schoolType = candidate.schoolType;

    if (!educationLevel) {
      return 50; // 没有学历信息时给中等分
    }

    // 使用自定义评分或默认评分
    const levelScores =
      weights.educationLevelScores ||
      this.getDefaultEducationScores();

    const levelScore = levelScores[educationLevel] || 50;

    // 学校类型加分
    const schoolScores = weights.schoolTypeScores || this.getDefaultSchoolScores();
    const schoolBonus = schoolType ? (schoolScores[schoolType] || 0) : 0;

    return Math.min(levelScore + schoolBonus * 0.3, 100);
  }

  /**
   * 计算工作经验匹配分数
   */
  private calculateExperienceMatch(job: any, candidate: any, weights: any): number {
    const requiredYears = job.minYearsExperience;
    const candidateYears = candidate.yearsOfExperience;

    if (!requiredYears) {
      return 80; // 没有要求时给高分
    }

    if (!candidateYears) {
      return 30; // 有要求但没信息时给低分
    }

    // 经验匹配计算
    const ratio = candidateYears / requiredYears;

    if (ratio >= 1.5) {
      return 100; // 经验远超要求
    } else if (ratio >= 1) {
      return 90; // 经验符合要求
    } else if (ratio >= 0.8) {
      return 70; // 经验略少
    } else {
      return Math.max(ratio * 50, 20); // 经验不足
    }
  }

  /**
   * 计算年龄匹配分数
   */
  private calculateAgeMatch(job: any, candidate: any, weights: any): number {
    const ageMin = job.ageMin;
    const ageMax = job.ageMax;
    const age = candidate.age;

    if (!ageMin && !ageMax) {
      return 100; // 没有年龄限制
    }

    if (!age) {
      return 50; // 没有年龄信息
    }

    if (ageMin && age < ageMin) {
      return 30; // 低于最小年龄
    }

    if (ageMax && age > ageMax) {
      return 30; // 超过最大年龄
    }

    // 在范围内
    return 100;
  }

  /**
   * 计算公司背景匹配分数
   */
  private async calculateCompanyMatch(
    job: any,
    candidate: any,
    weights: any,
  ): Promise<number> {
    const targetCompanies = job.targetCompanies || [];
    const workExperiences = candidate.workExperiences || [];

    if (targetCompanies.length === 0) {
      return 80; // 没有目标公司要求
    }

    let score = 0;

    // 检查是否在目标公司在职
    const currentWork = workExperiences.find((we: any) => we.isCurrent);
    if (currentWork && targetCompanies.includes(currentWork.companyId)) {
      score += weights.targetCompanyCurrentWeight * 100;
    }

    // 检查是否有目标公司过往经历
    const pastWork = workExperiences.some(
      (we: any) =>
        !we.isCurrent && targetCompanies.includes(we.companyId),
    );
    if (pastWork) {
      score += weights.targetCompanyPastWeight * 100;
    }

    // 检查是否有竞品公司经历
    const competitorWork = workExperiences.filter((we: any) => {
      // TODO: 查询公司是否为竞争对手
      return false; // 暂时返回 false
    });

    if (competitorWork.length > 0) {
      score += weights.competitorCompanyWeight * 100;
    }

    return Math.min(score, 100);
  }

  /**
   * upsert 匹配记录
   */
  private async upsertMatch(
    jobId: string,
    candidateId: string,
    matchData: any,
  ) {
    return this.prisma.jobMatch.upsert({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId,
        },
      },
      create: {
        ...matchData,
      },
      update: {
        ...matchData,
      },
    });
  }

  /**
   * 比较熟练度
   */
  private compareProficiency(
    current: string,
    required: string,
  ): number {
    const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
    const currentIndex = levels.indexOf(current);
    const requiredIndex = levels.indexOf(required);
    return currentIndex - requiredIndex;
  }

  /**
   * 获取默认权重配置
   */
  private getDefaultWeights() {
    return {
      skillWeight: 0.4,
      projectWeight: 0.25,
      educationWeight: 0.15,
      experienceWeight: 0.1,
      ageWeight: 0.05,
      companyBackgroundWeight: 0.05,
      educationLevelWeight: 0.5,
      schoolTypeWeight: 0.3,
      majorMatchWeight: 0.15,
      qsRankingWeight: 0.05,
      targetCompanyCurrentWeight: 0.5,
      targetCompanyPastWeight: 0.3,
      competitorCompanyWeight: 0.2,
    };
  }

  /**
   * 获取默认学历评分
   */
  private getDefaultEducationScores() {
    return {
      HIGH_SCHOOL: 30,
      VOCATIONAL: 40,
      BACHELOR: 60,
      MASTER: 80,
      PHD: 100,
    };
  }

  /**
   * 获取默认学校类型评分
   */
  private getDefaultSchoolScores() {
    return {
      TOP_985: 100,
      PROJECT_985: 85,
      PROJECT_211: 75,
      DOUBLE_FIRST: 80,
      PROVINCIAL_KEY: 70,
      ORDINARY_BACHELOR: 60,
      OVERSEAS: 90,
    };
  }
}
