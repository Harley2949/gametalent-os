import { IsString, IsOptional, IsArray, IsInt, IsEnum, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus, JobType, WorkMode, ExperienceLevel, Priority } from '@prisma/client';

// ============ Request DTOs ============

export class CreateJobDto {
  @ApiProperty({ description: '职位标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '职位描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '职位要求' })
  @IsString()
  requirements: string;

  @ApiProperty({ description: '工作职责' })
  @IsString()
  responsibilities: string;

  @ApiPropertyOptional({ description: '职位类型', enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @ApiPropertyOptional({ description: '工作模式', enum: WorkMode })
  @IsOptional()
  @IsEnum(WorkMode)
  workMode?: WorkMode;

  @ApiProperty({ description: '经验等级', enum: ExperienceLevel })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiPropertyOptional({ description: '优先级', enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ description: '最低薪资' })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional({ description: '最高薪资' })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiPropertyOptional({ description: '薪资货币' })
  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @ApiPropertyOptional({ description: '工作地点' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '远程地区', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remoteRegions?: string[];

  @ApiProperty({ description: '部门' })
  @IsString()
  department: string;

  @ApiPropertyOptional({ description: '团队' })
  @IsOptional()
  @IsString()
  team?: string;

  @ApiPropertyOptional({ description: '目标公司（竞品）', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCompanies?: string[];

  @ApiPropertyOptional({ description: '目标技能', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetSkills?: string[];
}

export class UpdateJobDto {
  @ApiPropertyOptional({ description: '职位标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '职位描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '职位要求' })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({ description: '工作职责' })
  @IsOptional()
  @IsString()
  responsibilities?: string;

  @ApiPropertyOptional({ description: '职位状态', enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ description: '职位类型', enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @ApiPropertyOptional({ description: '工作模式', enum: WorkMode })
  @IsOptional()
  @IsEnum(WorkMode)
  workMode?: WorkMode;

  @ApiPropertyOptional({ description: '经验等级', enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({ description: '优先级', enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ description: '最低薪资' })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional({ description: '最高薪资' })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiPropertyOptional({ description: '薪资货币' })
  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @ApiPropertyOptional({ description: '工作地点' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '远程地区', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remoteRegions?: string[];

  @ApiPropertyOptional({ description: '部门' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: '团队' })
  @IsOptional()
  @IsString()
  team?: string;

  @ApiPropertyOptional({ description: '目标公司（竞品）', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCompanies?: string[];

  @ApiPropertyOptional({ description: '目标技能', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetSkills?: string[];

  @ApiPropertyOptional({ description: '应聘人数' })
  @IsOptional()
  @IsInt()
  applicantCount?: number;

  @ApiPropertyOptional({ description: '面试人数' })
  @IsOptional()
  @IsInt()
  interviewCount?: number;

  @ApiPropertyOptional({ description: 'Offer 人数' })
  @IsOptional()
  @IsInt()
  offerCount?: number;
}

export class QueryJobsDto {
  @ApiPropertyOptional({ description: '页码', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  take?: number;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '状态筛选', enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ description: '部门筛选' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: '经验等级筛选', enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({ description: '优先级筛选', enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}

// ============ Response DTOs ============

export class JobDto {
  @ApiProperty({ description: '职位 ID' })
  id: string;

  @ApiProperty({ description: '职位标题' })
  title: string;

  @ApiProperty({ description: '职位描述' })
  description: string;

  @ApiProperty({ description: '职位要求' })
  requirements: string;

  @ApiProperty({ description: '工作职责' })
  responsibilities: string;

  @ApiProperty({ description: '职位状态', enum: JobStatus })
  status: JobStatus;

  @ApiProperty({ description: '职位类型', enum: JobType })
  type: JobType;

  @ApiProperty({ description: '工作模式', enum: WorkMode })
  workMode: WorkMode;

  @ApiProperty({ description: '经验等级', enum: ExperienceLevel })
  experienceLevel: ExperienceLevel;

  @ApiProperty({ description: '优先级', enum: Priority })
  priority: Priority;

  @ApiPropertyOptional({ description: '最低薪资' })
  salaryMin?: number;

  @ApiPropertyOptional({ description: '最高薪资' })
  salaryMax?: number;

  @ApiProperty({ description: '薪资货币' })
  salaryCurrency: string;

  @ApiPropertyOptional({ description: '工作地点' })
  location?: string;

  @ApiProperty({ description: '远程地区', type: [String] })
  remoteRegions: string[];

  @ApiProperty({ description: '部门' })
  department: string;

  @ApiPropertyOptional({ description: '团队' })
  team?: string;

  @ApiProperty({ description: '目标公司', type: [String] })
  targetCompanies: string[];

  @ApiProperty({ description: '目标技能', type: [String] })
  targetSkills: string[];

  @ApiProperty({ description: '应聘人数' })
  applicantCount: number;

  @ApiProperty({ description: '面试人数' })
  interviewCount: number;

  @ApiProperty({ description: 'Offer 人数' })
  offerCount: number;

  @ApiPropertyOptional({ description: '发布时间' })
  publishedAt?: Date;

  @ApiPropertyOptional({ description: '关闭时间' })
  closedAt?: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '创建者' })
  creator: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({ description: '负责人列表', type: [Object] })
  assignees: Array<{
    id: string;
    name: string;
    email: string;
  }>;

  @ApiProperty({ description: '统计数据' })
  _count: {
    applications: number;
  };
}
