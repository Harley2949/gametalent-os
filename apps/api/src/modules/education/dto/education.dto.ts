import { IsString, IsOptional, IsBoolean, IsInt, IsDateString, IsArray, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SchoolType, EducationLevel } from '@gametalent/db';

/**
 * 创建教育经历 DTO
 */
export class CreateEducationDto {
  @ApiProperty({ description: '候选人 ID' })
  @IsString()
  candidateId: string;

  // 学校基本信息
  @ApiProperty({ description: '学校名称' })
  @IsString()
  school: string;

  @ApiProperty({ description: '学校类型', enum: SchoolType })
  @IsEnum(SchoolType)
  schoolType: SchoolType;

  @ApiPropertyOptional({ description: '国家（海外学历）' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: '省份（国内学历）' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsString()
  @IsOptional()
  city?: string;

  // 学位/专业信息
  @ApiProperty({ description: '专业' })
  @IsString()
  major: string;

  @ApiPropertyOptional({ description: '学位名称' })
  @IsString()
  @IsOptional()
  degree?: string;

  @ApiProperty({ description: '学历层次', enum: EducationLevel })
  @IsEnum(EducationLevel)
  level: EducationLevel;

  // 海外学历特定字段
  @ApiPropertyOptional({ description: '是否海外学历' })
  @IsBoolean()
  @IsOptional()
  isOverseas?: boolean;

  @ApiPropertyOptional({ description: 'QS世界大学排名' })
  @IsInt()
  @IsOptional()
  qsRanking?: number;

  @ApiPropertyOptional({ description: 'THE排名' })
  @IsInt()
  @IsOptional()
  theRanking?: number;

  @ApiPropertyOptional({ description: 'ARWU软科排名' })
  @IsInt()
  @IsOptional()
  arwuRanking?: number;

  // 时间信息
  @ApiProperty({ description: '入学日期' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: '毕业日期' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  // 补充信息
  @ApiPropertyOptional({ description: 'GPA', type: Number })
  @IsNumber()
  @IsOptional()
  gpa?: number;

  @ApiPropertyOptional({ description: '荣誉奖项', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  honors?: string[];

  @ApiPropertyOptional({ description: '课程', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  courses?: string[];
}

/**
 * 更新教育经历 DTO
 */
export class UpdateEducationDto {
  @ApiPropertyOptional({ description: '学校名称' })
  @IsString()
  @IsOptional()
  school?: string;

  @ApiPropertyOptional({ description: '学校类型', enum: SchoolType })
  @IsEnum(SchoolType)
  @IsOptional()
  schoolType?: SchoolType;

  @ApiPropertyOptional({ description: '国家' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: '省份' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: '专业' })
  @IsString()
  @IsOptional()
  major?: string;

  @ApiPropertyOptional({ description: '学位名称' })
  @IsString()
  @IsOptional()
  degree?: string;

  @ApiPropertyOptional({ description: '学历层次', enum: EducationLevel })
  @IsEnum(EducationLevel)
  @IsOptional()
  level?: EducationLevel;

  @ApiPropertyOptional({ description: '是否海外学历' })
  @IsBoolean()
  @IsOptional()
  isOverseas?: boolean;

  @ApiPropertyOptional({ description: 'QS排名' })
  @IsInt()
  @IsOptional()
  qsRanking?: number;

  @ApiPropertyOptional({ description: 'THE排名' })
  @IsInt()
  @IsOptional()
  theRanking?: number;

  @ApiPropertyOptional({ description: 'ARWU排名' })
  @IsInt()
  @IsOptional()
  arwuRanking?: number;

  @ApiPropertyOptional({ description: '入学日期' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '毕业日期' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'GPA', type: Number })
  @IsNumber()
  @IsOptional()
  gpa?: number;

  @ApiPropertyOptional({ description: '荣誉奖项', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  honors?: string[];

  @ApiPropertyOptional({ description: '课程', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  courses?: string[];
}

/**
 * 查询教育经历 DTO
 */
export class QueryEducationDto {
  @ApiPropertyOptional({ description: '候选人 ID' })
  @IsString()
  @IsOptional()
  candidateId?: string;

  @ApiPropertyOptional({ description: '学校名称（模糊搜索）' })
  @IsString()
  @IsOptional()
  school?: string;

  @ApiPropertyOptional({ description: '学历层次', enum: EducationLevel })
  @IsEnum(EducationLevel)
  @IsOptional()
  level?: EducationLevel;

  @ApiPropertyOptional({ description: '是否海外学历' })
  @IsBoolean()
  @IsOptional()
  isOverseas?: boolean;

  @ApiPropertyOptional({ description: '专业（模糊搜索）' })
  @IsString()
  @IsOptional()
  major?: string;
}
