import { IsString, IsOptional, IsInt, IsBoolean, IsArray, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';

// ============ Request DTOs ============

export class CreateWorkExperienceDto {
  @ApiProperty({ description: '候选人ID' })
  @IsString()
  candidateId: string;

  @ApiPropertyOptional({ description: '公司ID（关联到Company表）' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({ description: '公司名称' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: '职位名称' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '职级' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: '部门' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: '入职时间' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: '离职时间' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '是否在职' })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional({ description: '工作地点' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '工作描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '工作成就', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @ApiPropertyOptional({ description: '团队规模' })
  @IsOptional()
  @IsInt()
  @Min(0)
  teamSize?: number;

  @ApiPropertyOptional({ description: '直属下属人数' })
  @IsOptional()
  @IsInt()
  @Min(0)
  directReports?: number;

  @ApiPropertyOptional({ description: '离职原因' })
  @IsOptional()
  @IsString()
  leaveReason?: string;

  @ApiPropertyOptional({ description: '是否目标竞品公司' })
  @IsOptional()
  @IsBoolean()
  isTargetCompany?: boolean;
}

export class UpdateWorkExperienceDto {
  @ApiPropertyOptional({ description: '公司ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: '公司名称' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: '职位名称' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '职级' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: '部门' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: '入职时间' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '离职时间' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '是否在职' })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional({ description: '工作地点' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '工作描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '成就', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @ApiPropertyOptional({ description: '团队规模' })
  @IsOptional()
  @IsInt()
  @Min(0)
  teamSize?: number;

  @ApiPropertyOptional({ description: '直属下属' })
  @IsOptional()
  @IsInt()
  @Min(0)
  directReports?: number;

  @ApiPropertyOptional({ description: '离职原因' })
  @IsOptional()
  @IsString()
  leaveReason?: string;

  @ApiPropertyOptional({ description: '目标公司' })
  @IsOptional()
  @IsBoolean()
  isTargetCompany?: boolean;
}

export class QueryWorkExperiencesDto {
  @ApiPropertyOptional({ description: '候选人ID' })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @ApiPropertyOptional({ description: '公司ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: '公司名称（搜索）' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: '是否在职' })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional({ description: '是否目标公司' })
  @IsOptional()
  @IsBoolean()
  isTargetCompany?: boolean;

  @ApiPropertyOptional({ description: '页码', minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ============ Response DTOs ============

export class WorkExperienceResponseDto {
  @ApiProperty({ description: '工作经历ID' })
  id: string;

  @ApiProperty({ description: '候选人ID' })
  candidateId: string;

  @ApiPropertyOptional({ description: '公司ID' })
  companyId?: string;

  @ApiProperty({ description: '公司名称' })
  companyName: string;

  @ApiProperty({ description: '职位名称' })
  title: string;

  @ApiPropertyOptional({ description: '职级' })
  level?: string;

  @ApiPropertyOptional({ description: '部门' })
  department?: string;

  @ApiProperty({ description: '入职时间' })
  startDate: Date;

  @ApiPropertyOptional({ description: '离职时间' })
  endDate?: Date;

  @ApiProperty({ description: '是否在职' })
  isCurrent: boolean;

  @ApiPropertyOptional({ description: '工作地点' })
  location?: string;

  @ApiPropertyOptional({ description: '工作描述' })
  description?: string;

  @ApiPropertyOptional({ description: '工作成就', type: [String] })
  achievements?: string[];

  @ApiPropertyOptional({ description: '团队规模' })
  teamSize?: number;

  @ApiPropertyOptional({ description: '直属下属' })
  directReports?: number;

  @ApiPropertyOptional({ description: '离职原因' })
  leaveReason?: string;

  @ApiProperty({ description: '是否目标公司' })
  isTargetCompany?: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
