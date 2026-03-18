import { IsString, IsOptional, IsEnum, IsInt, IsDateString, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InterviewStatus, InterviewType, InterviewStage } from '@prisma/client';

// ============ Request DTOs ============

export class CreateInterviewDto {
  @ApiPropertyOptional({ description: '应聘 ID（可选，如果未提供则使用候选人的最新应聘）' })
  @IsOptional()
  @IsString()
  applicationId?: string;

  @ApiProperty({ description: '候选人 ID（当applicationId未提供时必填）' })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @ApiPropertyOptional({ description: '面试官 ID（可选，未提供时使用当前用户）' })
  @IsOptional()
  @IsString()
  interviewerId?: string;

  @ApiProperty({ description: '面试标题' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '面试描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '面试类型', enum: InterviewType })
  @IsEnum(InterviewType)
  type: InterviewType;

  @ApiProperty({ description: '面试阶段', enum: InterviewStage })
  @IsEnum(InterviewStage)
  stage: InterviewStage;

  @ApiProperty({ description: '面试时间' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ description: '面试时长（分钟）' })
  @IsInt()
  @Min(15)
  @Max(480)
  duration: number;

  @ApiPropertyOptional({ description: '面试地点或会议链接' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '面试备注' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInterviewDto {
  @ApiPropertyOptional({ description: '面试标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '面试描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '面试状态', enum: InterviewStatus })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @ApiPropertyOptional({ description: '面试时间' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: '面试时长（分钟）' })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  duration?: number;

  @ApiPropertyOptional({ description: '面试地点或会议链接' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '面试分数（1-5）' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  score?: number;

  @ApiPropertyOptional({ description: '面试备注' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: '结构化反馈（JSON）' })
  @IsOptional()
  feedback?: any;

  @ApiPropertyOptional({ description: '后续步骤' })
  @IsOptional()
  @IsString()
  nextSteps?: string;

  @ApiPropertyOptional({ description: '跟进时间' })
  @IsOptional()
  @IsDateString()
  followUpAt?: string;
}

export class QueryInterviewsDto {
  @ApiPropertyOptional({ description: '页码', default: 0 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take?: number;

  @ApiPropertyOptional({ description: '应聘 ID 筛选' })
  @IsOptional()
  @IsString()
  applicationId?: string;

  @ApiPropertyOptional({ description: '面试官 ID 筛选' })
  @IsOptional()
  @IsString()
  interviewerId?: string;

  @ApiPropertyOptional({ description: '状态筛选', enum: InterviewStatus })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @ApiPropertyOptional({ description: '阶段筛选', enum: InterviewStage })
  @IsOptional()
  @IsEnum(InterviewStage)
  stage?: InterviewStage;

  @ApiPropertyOptional({ description: '开始日期（日历视图）' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期（日历视图）' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class InterviewFeedbackDto {
  @ApiProperty({ description: '面试分数（1-5）' })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @ApiPropertyOptional({ description: '优点' })
  @IsOptional()
  @IsString()
  pros?: string;

  @ApiPropertyOptional({ description: '缺点' })
  @IsOptional()
  @IsString()
  cons?: string;

  @ApiProperty({ description: '备注' })
  @IsString()
  notes: string;

  @ApiPropertyOptional({ description: '标签', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// ============ Response DTOs ============

export class InterviewDto {
  @ApiProperty({ description: '面试 ID' })
  id: string;

  @ApiProperty({ description: '应聘 ID' })
  applicationId: string;

  @ApiProperty({ description: '面试官 ID' })
  interviewerId: string;

  @ApiProperty({ description: '面试标题' })
  title: string;

  @ApiPropertyOptional({ description: '面试描述' })
  description?: string;

  @ApiProperty({ description: '面试状态', enum: InterviewStatus })
  status: InterviewStatus;

  @ApiProperty({ description: '面试类型', enum: InterviewType })
  type: InterviewType;

  @ApiProperty({ description: '面试阶段', enum: InterviewStage })
  stage: InterviewStage;

  @ApiProperty({ description: '面试时间' })
  scheduledAt: Date;

  @ApiProperty({ description: '面试时长（分钟）' })
  duration: number;

  @ApiPropertyOptional({ description: '面试地点或会议链接' })
  location?: string;

  @ApiPropertyOptional({ description: '面试分数（1-5）' })
  score?: number;

  @ApiPropertyOptional({ description: '面试备注' })
  notes?: string;

  @ApiPropertyOptional({ description: '结构化反馈' })
  feedback?: any;

  @ApiPropertyOptional({ description: '后续步骤' })
  nextSteps?: string;

  @ApiPropertyOptional({ description: '跟进时间' })
  followUpAt?: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '应聘信息' })
  application?: any;

  @ApiProperty({ description: '面试官信息' })
  interviewer?: any;
}

export class CalendarEventDto {
  @ApiProperty({ description: '面试 ID' })
  id: string;

  @ApiProperty({ description: '面试标题' })
  title: string;

  @ApiProperty({ description: '开始时间' })
  start: Date;

  @ApiProperty({ description: '结束时间' })
  end: Date;

  @ApiProperty({ description: '候选人姓名' })
  candidateName: string;

  @ApiProperty({ description: '职位名称' })
  jobTitle: string;

  @ApiProperty({ description: '面试阶段' })
  stage: InterviewStage;

  @ApiProperty({ description: '状态', enum: InterviewStatus })
  status: InterviewStatus;
}
