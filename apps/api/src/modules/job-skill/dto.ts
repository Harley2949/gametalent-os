import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SkillCategory, SkillProficiency, SkillImportance } from '@prisma/client';

// ============ Request DTOs ============

export class CreateJobSkillDto {
  @ApiProperty({ description: '职位ID' })
  @IsString()
  jobId: string;

  @ApiProperty({ description: '技能名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '技能分类', enum: SkillCategory })
  @IsEnum(SkillCategory)
  category: SkillCategory;

  @ApiPropertyOptional({ description: '重要性', enum: SkillImportance })
  @IsOptional()
  @IsEnum(SkillImportance)
  importance?: SkillImportance;

  @ApiPropertyOptional({ description: '最低熟练度', enum: SkillProficiency })
  @IsOptional()
  @IsEnum(SkillProficiency)
  minProficiency?: SkillProficiency;

  @ApiPropertyOptional({ description: '最低经验年限（年）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  minYears?: number;
}

export class UpdateJobSkillDto {
  @ApiPropertyOptional({ description: '技能名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '技能分类', enum: SkillCategory })
  @IsOptional()
  @IsEnum(SkillCategory)
  category?: SkillCategory;

  @ApiPropertyOptional({ description: '重要性', enum: SkillImportance })
  @IsOptional()
  @IsEnum(SkillImportance)
  importance?: SkillImportance;

  @ApiPropertyOptional({ description: '最低熟练度' })
  @IsOptional()
  @IsEnum(SkillProficiency)
  minProficiency?: SkillProficiency;

  @ApiPropertyOptional({ description: '最低经验年限' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  minYears?: number;
}

export class QueryJobSkillsDto {
  @ApiPropertyOptional({ description: '职位ID' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiPropertyOptional({ description: '技能分类', enum: SkillCategory })
  @IsOptional()
  @IsEnum(SkillCategory)
  category?: SkillCategory;

  @ApiPropertyOptional({ description: '重要性', enum: SkillImportance })
  @IsOptional()
  @IsEnum(SkillImportance)
  importance?: SkillImportance;

  @ApiPropertyOptional({ description: '页码', minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

// ============ Response DTOs ============

export class JobSkillResponseDto {
  @ApiProperty({ description: '技能要求ID' })
  id: string;

  @ApiProperty({ description: '职位ID' })
  jobId: string;

  @ApiProperty({ description: '技能名称' })
  name: string;

  @ApiProperty({ description: '技能分类', enum: SkillCategory })
  category: SkillCategory;

  @ApiProperty({ description: '重要性', enum: SkillImportance })
  importance: SkillImportance;

  @ApiPropertyOptional({ description: '最低熟练度' })
  minProficiency?: SkillProficiency;

  @ApiPropertyOptional({ description: '最低经验年限' })
  minYears?: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}
