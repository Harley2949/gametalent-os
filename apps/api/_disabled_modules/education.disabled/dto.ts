import { IsString, IsOptional, IsInt, IsBoolean, IsArray, IsEnum, IsDateString, Min, IsNumber, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EducationLevel, SchoolType } from '@prisma/client';

// ============ Request DTOs ============

export class CreateEducationDto {
  @ApiProperty({ description: '候选人ID' })
  @IsString()
  candidateId: string;

  @ApiProperty({ description: '学校名称' })
  @IsString()
  school: string;

  @ApiProperty({ description: '学校类型', enum: SchoolType })
  @IsEnum(SchoolType)
  schoolType: SchoolType;

  @ApiPropertyOptional({ description: '国家（海外学历）' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: '省份（国内学历）' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: '专业' })
  @IsString()
  major: string;

  @ApiPropertyOptional({ description: '学位名称' })
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiProperty({ description: '学历等级', enum: EducationLevel })
  @IsEnum(EducationLevel)
  level: EducationLevel;

  @ApiPropertyOptional({ description: '是否海外学历' })
  @IsOptional()
  @IsBoolean()
  isOverseas?: boolean;

  @ApiPropertyOptional({ description: 'QS世界大学排名' })
  @IsOptional()
  @IsInt()
  qsRanking?: number;

  @ApiPropertyOptional({ description: 'THE排名' })
  @IsOptional()
  @IsInt()
  theRanking?: number;

  @ApiPropertyOptional({ description: 'ARWU软科排名' })
  @IsOptional()
  @IsInt()
  arwuRanking?: number;

  @ApiPropertyOptional({ description: '是否双一流' })
  @IsOptional()
  @IsBoolean()
  isDoubleFirst?: boolean;

  @ApiPropertyOptional({ description: '是否985' })
  @IsOptional()
  @IsBoolean()
  is985?: boolean;

  @ApiPropertyOptional({ description: '是否211' })
  @IsOptional()
  @IsBoolean()
  is211?: boolean;

  @ApiPropertyOptional({ description: '入学时间' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '毕业时间' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '毕业年份' })
  @IsOptional()
  @IsInt()
  graduationYear?: number;

  @ApiPropertyOptional({ description: 'GPA分数' })
  @IsOptional()
  @IsNumber()
  gpa?: number;

  @ApiPropertyOptional({ description: 'GPA满分' })
  @IsOptional()
  @IsNumber()
  gpaScale?: number;

  @ApiPropertyOptional({ description: 'GPA类型' })
  @IsOptional()
  @IsString()
  gpaType?: string;

  @ApiPropertyOptional({ description: '获得的荣誉', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  honors?: string[];

  @ApiPropertyOptional({ description: '奖学金', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scholarships?: string[];

  @ApiPropertyOptional({ description: '相关课程', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  courses?: string[];

  @ApiPropertyOptional({ description: '研究方向' })
  @IsOptional()
  @IsString()
  research?: string;

  @ApiPropertyOptional({ description: '毕业论文题目' })
  @IsOptional()
  @IsString()
  dissertation?: string;
}

export class UpdateEducationDto {
  @ApiPropertyOptional({ description: '学校名称' })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiPropertyOptional({ description: '学校类型', enum: SchoolType })
  @IsOptional()
  @IsEnum(SchoolType)
  schoolType?: SchoolType;

  @ApiPropertyOptional({ description: '国家' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: '省份' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: '专业' })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiPropertyOptional({ description: '学位名称' })
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiPropertyOptional({ description: '学历等级', enum: EducationLevel })
  @IsOptional()
  @IsEnum(EducationLevel)
  level?: EducationLevel;

  @ApiPropertyOptional({ description: '是否海外学历' })
  @IsOptional()
  @IsBoolean()
  isOverseas?: boolean;

  @ApiPropertyOptional({ description: 'QS排名' })
  @IsOptional()
  @IsInt()
  qsRanking?: number;

  @ApiPropertyOptional({ description: 'THE排名' })
  @IsOptional()
  @IsInt()
  theRanking?: number;

  @ApiPropertyOptional({ description: 'ARWU排名' })
  @IsOptional()
  @IsInt()
  arwuRanking?: number;

  @ApiPropertyOptional({ description: '是否双一流' })
  @IsOptional()
  @IsBoolean()
  isDoubleFirst?: boolean;

  @ApiPropertyOptional({ description: '是否985' })
  @IsOptional()
  @IsBoolean()
  is985?: boolean;

  @ApiPropertyOptional({ description: '是否211' })
  @IsOptional()
  @IsBoolean()
  is211?: boolean;

  @ApiPropertyOptional({ description: '入学时间' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '毕业时间' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '毕业年份' })
  @IsOptional()
  @IsInt()
  graduationYear?: number;

  @ApiPropertyOptional({ description: 'GPA分数' })
  @IsOptional()
  @IsNumber()
  gpa?: number;

  @ApiPropertyOptional({ description: 'GPA满分' })
  @IsOptional()
  @IsNumber()
  gpaScale?: number;

  @ApiPropertyOptional({ description: 'GPA类型' })
  @IsOptional()
  @IsString()
  gpaType?: string;

  @ApiPropertyOptional({ description: '荣誉', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  honors?: string[];

  @ApiPropertyOptional({ description: '奖学金', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scholarships?: string[];

  @ApiPropertyOptional({ description: '课程', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  courses?: string[];

  @ApiPropertyOptional({ description: '研究方向' })
  @IsOptional()
  @IsString()
  research?: string;

  @ApiPropertyOptional({ description: '毕业论文' })
  @IsOptional()
  @IsString()
  dissertation?: string;

  @ApiPropertyOptional({ description: '是否已验证' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class QueryEducationsDto {
  @ApiPropertyOptional({ description: '候选人ID' })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @ApiPropertyOptional({ description: '学校名称（搜索）' })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiPropertyOptional({ description: '学校类型', enum: SchoolType })
  @IsOptional()
  @IsEnum(SchoolType)
  schoolType?: SchoolType;

  @ApiPropertyOptional({ description: '学历等级', enum: EducationLevel })
  @IsOptional()
  @IsEnum(EducationLevel)
  level?: EducationLevel;

  @ApiPropertyOptional({ description: '是否海外学历' })
  @IsOptional()
  @IsBoolean()
  isOverseas?: boolean;

  @ApiPropertyOptional({ description: 'QS排名最大值' })
  @IsOptional()
  @IsInt()
  @Min(1)
  qsRankingMax?: number;

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

export class EducationResponseDto {
  @ApiProperty({ description: '教育经历ID' })
  id: string;

  @ApiProperty({ description: '候选人ID' })
  candidateId: string;

  @ApiProperty({ description: '学校名称' })
  school: string;

  @ApiProperty({ description: '学校类型', enum: SchoolType })
  schoolType: SchoolType;

  @ApiPropertyOptional({ description: '国家' })
  country?: string;

  @ApiPropertyOptional({ description: '省份' })
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  city?: string;

  @ApiProperty({ description: '专业' })
  major: string;

  @ApiPropertyOptional({ description: '学位名称' })
  degree?: string;

  @ApiProperty({ description: '学历等级', enum: EducationLevel })
  level: EducationLevel;

  @ApiProperty({ description: '是否海外学历' })
  isOverseas: boolean;

  @ApiPropertyOptional({ description: 'QS排名' })
  qsRanking?: number;

  @ApiPropertyOptional({ description: 'THE排名' })
  theRanking?: number;

  @ApiPropertyOptional({ description: 'ARWU排名' })
  arwuRanking?: number;

  @ApiProperty({ description: '是否双一流' })
  isDoubleFirst: boolean;

  @ApiProperty({ description: '是否985' })
  is985: boolean;

  @ApiProperty({ description: '是否211' })
  is211: boolean;

  @ApiPropertyOptional({ description: '入学时间' })
  startDate?: Date;

  @ApiPropertyOptional({ description: '毕业时间' })
  endDate?: Date;

  @ApiPropertyOptional({ description: '毕业年份' })
  graduationYear?: number;

  @ApiPropertyOptional({ description: 'GPA分数' })
  gpa?: number;

  @ApiPropertyOptional({ description: 'GPA满分' })
  gpaScale?: number;

  @ApiPropertyOptional({ description: 'GPA类型' })
  gpaType?: string;

  @ApiProperty({ description: '获得的荣誉', type: [String] })
  honors?: string[];

  @ApiProperty({ description: '奖学金', type: [String] })
  scholarships?: string[];

  @ApiProperty({ description: '相关课程', type: [String] })
  courses?: string[];

  @ApiPropertyOptional({ description: '研究方向' })
  research?: string;

  @ApiPropertyOptional({ description: '毕业论文' })
  dissertation?: string;

  @ApiProperty({ description: '是否已验证' })
  isVerified: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
