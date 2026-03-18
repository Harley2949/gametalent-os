import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '@prisma/client';

// ============ Request DTOs ============

export class CreateJobMatchDto {
  @ApiProperty({ description: '职位ID' })
  @IsString()
  jobId: string;

  @ApiProperty({ description: '候选人ID' })
  @IsString()
  candidateId: string;

  @ApiProperty({ description: '简历ID' })
  @IsString()
  resumeId: string;

  @ApiPropertyOptional({ description: '匹配状态', enum: MatchStatus })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;
}

export class UpdateJobMatchDto {
  @ApiPropertyOptional({ description: '匹配状态', enum: MatchStatus })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ description: 'HR备注' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: '已联系' })
  @IsOptional()
  @IsBoolean()
  contactedAt?: boolean;

  @ApiPropertyOptional({ description: '收到回复' })
  @IsOptional()
  @IsBoolean()
  responseReceived?: boolean;
}

export class QueryJobMatchesDto {
  @ApiPropertyOptional({ description: '职位ID' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiPropertyOptional({ description: '候选人ID' })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @ApiPropertyOptional({ description: '匹配状态', enum: MatchStatus })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ description: '最低分数' })
  @IsOptional()
  @IsNumber()
  minScore?: number;

  @ApiPropertyOptional({ description: '最高分数' })
  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @ApiPropertyOptional({ description: '页码', minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

// ============ AI 匹配触发 DTO ============

export class TriggerJobMatchingDto {
  @ApiProperty({ description: '职位ID' })
  @IsString()
  jobId: string;

  @ApiPropertyOptional({ description: '候选人ID（可选，指定候选人）' })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @ApiPropertyOptional({ description: '是否重新计算已存在的匹配' })
  @IsOptional()
  @IsBoolean()
  recalculate?: boolean;
}

// ============ Response DTOs ============

export class JobMatchResponseDto {
  @ApiProperty({ description: '匹配记录ID' })
  id: string;

  @ApiProperty({ description: '职位ID' })
  jobId: string;

  @ApiProperty({ description: '候选人ID' })
  candidateId: string;

  @ApiProperty({ description: '简历ID' })
  resumeId: string;

  @ApiProperty({ description: '匹配状态', enum: MatchStatus })
  status: MatchStatus;

  @ApiPropertyOptional({ description: '总体匹配分数 (0-100)' })
  overallScore?: number;

  @ApiPropertyOptional({ description: '技能匹配分数' })
  skillScore?: number;

  @ApiPropertyOptional({ description: '项目经验匹配分数' })
  projectScore?: number;

  @ApiPropertyOptional({ description: '学历匹配分数' })
  educationScore?: number;

  @ApiPropertyOptional({ description: '工作经验匹配分数' })
  experienceScore?: number;

  @ApiPropertyOptional({ description: '年龄匹配分数' })
  ageScore?: number;

  @ApiPropertyOptional({ description: '公司背景匹配分数' })
  companyBackgroundScore?: number;

  @ApiPropertyOptional({ description: '匹配详情（JSON）' })
  skillDetails?: any;

  @ApiPropertyOptional({ description: '项目详情（JSON）' })
  projectDetails?: any;

  @ApiPropertyOptional({ description: '学历详情（JSON）' })
  educationDetails?: any;

  @ApiPropertyOptional({ description: '经验详情（JSON）' })
  experienceDetails?: any;

  @ApiPropertyOptional({ description: '年龄详情（JSON）' })
  ageDetails?: any;

  @ApiPropertyOptional({ description: '公司背景详情（JSON）' })
  companyBackgroundDetails?: any;

  @ApiPropertyOptional({ description: '评分分解（JSON）' })
  scoreBreakdown?: any;

  @ApiPropertyOptional({ description: '匹配亮点', type: [String] })
  highlights?: string[];

  @ApiPropertyOptional({ description: '缺失技能', type: [String] })
  missingSkills?: string[];

  @ApiPropertyOptional({ description: '缺失条件', type: [String] })
  missingCriteria?: string[];

  @ApiPropertyOptional({ description: '匹配原因' })
  matchReason?: string;

  @ApiPropertyOptional({ description: '不匹配原因' })
  mismatchReason?: string;

  @ApiPropertyOptional({ description: 'HR备注' })
  notes?: string;

  @ApiPropertyOptional({ description: '联系时间' })
  contactedAt?: Date;

  @ApiPropertyOptional({ description: '是否收到回复' })
  responseReceived?: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
