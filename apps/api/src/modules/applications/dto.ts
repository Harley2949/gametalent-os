import { IsString, IsOptional, IsEnum, IsInt, IsArray, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus, TransparencyLevel } from '@prisma/client';

// ============ Request DTOs ============

export class CreateApplicationDto {
  @ApiProperty({ description: '职位 ID' })
  @IsString()
  jobId: string;

  @ApiProperty({ description: '候选人 ID' })
  @IsString()
  candidateId: string;

  @ApiPropertyOptional({ description: '求职信' })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiPropertyOptional({ description: '来源' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '推荐来源' })
  @IsOptional()
  @IsString()
  referralSource?: string;

  @ApiPropertyOptional({ description: '透明度级别', enum: TransparencyLevel })
  @IsOptional()
  @IsEnum(TransparencyLevel)
  transparencyLevel?: TransparencyLevel;
}

export class UpdateApplicationDto {
  @ApiPropertyOptional({ description: '状态', enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ description: '透明度级别', enum: TransparencyLevel })
  @IsOptional()
  @IsEnum(TransparencyLevel)
  transparencyLevel?: TransparencyLevel;

  @ApiPropertyOptional({ description: '来源' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '推荐来源' })
  @IsOptional()
  @IsString()
  referralSource?: string;

  @ApiPropertyOptional({ description: '筛选分数' })
  @IsOptional()
  screeningScore?: number;

  @ApiPropertyOptional({ description: '筛选备注' })
  @IsOptional()
  @IsString()
  screeningNotes?: string;

  @ApiPropertyOptional({ description: 'AI 匹配分数' })
  @IsOptional()
  matchScore?: number;

  @ApiPropertyOptional({ description: '匹配详情（JSON）' })
  @IsOptional()
  matchDetails?: any;
}

export class QueryApplicationsDto {
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

  @ApiPropertyOptional({ description: '职位 ID 筛选' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiPropertyOptional({ description: '候选人 ID 筛选' })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @ApiPropertyOptional({ description: '状态筛选', enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: string;

  @ApiPropertyOptional({ description: '来源筛选' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ description: '新状态', enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ScreenApplicationDto {
  @ApiPropertyOptional({ description: '筛选分数（0-100）' })
  @IsOptional()
  @IsInt()
  screeningScore?: number;

  @ApiPropertyOptional({ description: '筛选备注' })
  @IsOptional()
  @IsString()
  screeningNotes?: string;

  @ApiPropertyOptional({ description: '是否通过筛选' })
  @IsOptional()
  passed?: boolean;
}

// ============ Response DTOs ============

export class ApplicationDto {
  @ApiProperty({ description: '应聘 ID' })
  id: string;

  @ApiProperty({ description: '职位 ID' })
  jobId: string;

  @ApiProperty({ description: '候选人 ID' })
  candidateId: string;

  @ApiProperty({ description: '状态', enum: ApplicationStatus })
  status: ApplicationStatus;

  @ApiProperty({ description: '透明度级别', enum: TransparencyLevel })
  transparencyLevel: TransparencyLevel;

  @ApiPropertyOptional({ description: '求职信' })
  coverLetter?: string;

  @ApiPropertyOptional({ description: '来源' })
  source?: string;

  @ApiPropertyOptional({ description: '推荐来源' })
  referralSource?: string;

  @ApiPropertyOptional({ description: '筛选分数' })
  screeningScore?: number;

  @ApiPropertyOptional({ description: '筛选备注' })
  screeningNotes?: string;

  @ApiProperty({ description: '筛选时间' })
  screenedAt?: Date;

  @ApiProperty({ description: '筛选人 ID' })
  screenedBy?: string;

  @ApiPropertyOptional({ description: 'AI 匹配分数' })
  matchScore?: number;

  @ApiProperty({ description: '匹配详情' })
  matchDetails?: any;

  @ApiProperty({ description: '申请时间' })
  appliedAt: Date;

  @ApiPropertyOptional({ description: '首次响应时间' })
  firstResponseAt?: Date;

  @ApiPropertyOptional({ description: '最后联系时间' })
  lastContactAt?: Date;

  @ApiPropertyOptional({ description: '关闭时间' })
  closedAt?: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '职位信息' })
  job?: any;

  @ApiProperty({ description: '候选人信息' })
  candidate?: any;
}

export class ApplicationWithDetailsDto extends ApplicationDto {
  @ApiProperty({ description: '面试记录', type: [Object] })
  interviews: any[];

  @ApiProperty({ description: '反馈记录', type: [Object] })
  feedback: any[];

  @ApiProperty({ description: 'Offer 信息' })
  offer?: any;
}
