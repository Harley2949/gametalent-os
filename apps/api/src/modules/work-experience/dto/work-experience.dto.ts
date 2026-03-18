import { IsString, IsOptional, IsBoolean, IsInt, IsDateString, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建工作经历 DTO
 */
export class CreateWorkExperienceDto {
  @ApiProperty({ description: '候选人 ID' })
  @IsString()
  candidateId: string;

  // 公司信息
  @ApiPropertyOptional({ description: '公司 ID（关联 Company 表）' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiProperty({ description: '公司名称' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: '职位' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '职级' })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({ description: '部门' })
  @IsString()
  @IsOptional()
  department?: string;

  // 时间信息
  @ApiProperty({ description: '开始日期' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: '是否在职' })
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  // 工作详情
  @ApiPropertyOptional({ description: '工作地点' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: '工作描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '成就列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  achievements?: string[];

  // 团队信息
  @ApiPropertyOptional({ description: '团队规模' })
  @IsInt()
  @Min(1)
  @IsOptional()
  teamSize?: number;

  @ApiPropertyOptional({ description: '直属下属人数' })
  @IsInt()
  @Min(0)
  @IsOptional()
  directReports?: number;

  // 离职原因
  @ApiPropertyOptional({ description: '离职原因' })
  @IsString()
  @IsOptional()
  leaveReason?: string;
}

/**
 * 更新工作经历 DTO
 */
export class UpdateWorkExperienceDto {
  @ApiPropertyOptional({ description: '公司 ID' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ description: '公司名称' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ description: '职位' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '职级' })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({ description: '部门' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: '是否在职' })
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @ApiPropertyOptional({ description: '工作地点' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: '工作描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '成就列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  achievements?: string[];

  @ApiPropertyOptional({ description: '团队规模' })
  @IsInt()
  @Min(1)
  @IsOptional()
  teamSize?: number;

  @ApiPropertyOptional({ description: '直属下属人数' })
  @IsInt()
  @Min(0)
  @IsOptional()
  directReports?: number;

  @ApiPropertyOptional({ description: '离职原因' })
  @IsString()
  @IsOptional()
  leaveReason?: string;
}

/**
 * 查询工作经历 DTO
 */
export class QueryWorkExperienceDto {
  @ApiPropertyOptional({ description: '候选人 ID' })
  @IsString()
  @IsOptional()
  candidateId?: string;

  @ApiPropertyOptional({ description: '公司名称（模糊搜索）' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ description: '职位（模糊搜索）' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '是否在职' })
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;
}
