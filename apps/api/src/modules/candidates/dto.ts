import { IsString, IsEmail, IsOptional, IsArray, IsInt, IsEnum, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CandidateSource, CandidateStatus } from '@prisma/client';

// ============ Request DTOs ============

export class CreateCandidateDto {
  @ApiProperty({ description: '候选人邮箱' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '候选人姓名' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: '头像 URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '来源', enum: CandidateSource })
  @IsOptional()
  @IsEnum(CandidateSource)
  source?: CandidateSource;

  @ApiPropertyOptional({ description: '来源 URL' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'LinkedIn 主页' })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'GitHub 主页' })
  @IsOptional()
  @IsString()
  githubUrl?: string;

  @ApiPropertyOptional({ description: '作品集 URL' })
  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @ApiPropertyOptional({ description: '所在地' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '当前公司' })
  @IsOptional()
  @IsString()
  currentCompany?: string;

  @ApiPropertyOptional({ description: '当前职位' })
  @IsOptional()
  @IsString()
  currentTitle?: string;

  @ApiPropertyOptional({ description: '期望薪资' })
  @IsOptional()
  @IsString()
  expectedSalary?: string;

  @ApiPropertyOptional({ description: '到岗时间' })
  @IsOptional()
  @IsString()
  noticePeriod?: string;

  @ApiPropertyOptional({ description: '工作年限' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: '标签', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateCandidateDto {
  @ApiPropertyOptional({ description: '候选人邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '候选人姓名' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: '头像 URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '状态', enum: CandidateStatus })
  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;

  @ApiPropertyOptional({ description: '来源', enum: CandidateSource })
  @IsOptional()
  @IsEnum(CandidateSource)
  source?: CandidateSource;

  @ApiPropertyOptional({ description: '来源 URL' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'LinkedIn 主页' })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'GitHub 主页' })
  @IsOptional()
  @IsString()
  githubUrl?: string;

  @ApiPropertyOptional({ description: '作品集 URL' })
  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @ApiPropertyOptional({ description: '所在地' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '当前公司' })
  @IsOptional()
  @IsString()
  currentCompany?: string;

  @ApiPropertyOptional({ description: '当前职位' })
  @IsOptional()
  @IsString()
  currentTitle?: string;

  @ApiPropertyOptional({ description: '期望薪资' })
  @IsOptional()
  @IsString()
  expectedSalary?: string;

  @ApiPropertyOptional({ description: '到岗时间' })
  @IsOptional()
  @IsString()
  noticePeriod?: string;

  @ApiPropertyOptional({ description: '工作年限' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: '标签', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '竞品公司映射数据' })
  @IsOptional()
  competitorMapping?: any;

  @ApiPropertyOptional({ description: '招聘流程阶段' })
  @IsOptional()
  @IsString()
  stage?: string;
}

export class QueryCandidatesDto {
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

  @ApiPropertyOptional({ description: '状态筛选', enum: CandidateStatus })
  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;

  @ApiPropertyOptional({ description: '来源筛选', enum: CandidateSource })
  @IsOptional()
  @IsEnum(CandidateSource)
  source?: CandidateSource;

  @ApiPropertyOptional({ description: '标签筛选', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '公司筛选' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: '技能标签筛选' })
  @IsOptional()
  @IsString()
  skill?: string;
}

export class UploadResumeDto {
  @ApiProperty({ description: '简历文件' })
  file: any;

  @ApiPropertyOptional({ description: '简历标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '是否设为主简历' })
  @IsOptional()
  isPrimary?: boolean;
}

// ============ Response DTOs ============

export class CandidateDto {
  @ApiProperty({ description: '候选人 ID' })
  id: string;

  @ApiProperty({ description: '邮箱' })
  email: string;

  @ApiProperty({ description: '姓名' })
  name: string;

  @ApiPropertyOptional({ description: '手机号' })
  phoneNumber?: string;

  @ApiPropertyOptional({ description: '头像' })
  avatar?: string;

  @ApiProperty({ description: '状态', enum: CandidateStatus })
  status: CandidateStatus;

  @ApiProperty({ description: '来源', enum: CandidateSource })
  source: CandidateSource;

  @ApiPropertyOptional({ description: '来源 URL' })
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'LinkedIn' })
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'GitHub' })
  githubUrl?: string;

  @ApiPropertyOptional({ description: '作品集' })
  portfolioUrl?: string;

  @ApiPropertyOptional({ description: '所在地' })
  location?: string;

  @ApiPropertyOptional({ description: '当前公司' })
  currentCompany?: string;

  @ApiPropertyOptional({ description: '当前职位' })
  currentTitle?: string;

  @ApiPropertyOptional({ description: '期望薪资' })
  expectedSalary?: string;

  @ApiPropertyOptional({ description: '到岗时间' })
  noticePeriod?: string;

  @ApiPropertyOptional({ description: '工作年限' })
  yearsOfExperience?: number;

  @ApiPropertyOptional({ description: '备注' })
  notes?: string;

  @ApiProperty({ description: '标签', type: [String] })
  tags: string[];

  @ApiProperty({ description: '简历数量' })
  _count: {
    resumes: number;
    applications: number;
  };

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export class CandidateWithDetailsDto extends CandidateDto {
  @ApiProperty({ description: '简历列表', type: [Object] })
  resumes: any[];

  @ApiProperty({ description: '应聘记录', type: [Object] })
  applications: any[];
}
