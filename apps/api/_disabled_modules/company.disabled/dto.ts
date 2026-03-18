import { IsString, IsOptional, IsArray, IsBoolean, IsEnum, IsUrl, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyType, CompanyScale } from '@prisma/client';

// ============ Request DTOs ============

export class CreateCompanyDto {
  @ApiProperty({ description: '公司标准名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '英文名' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: '别名列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @ApiPropertyOptional({ description: '简称' })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiProperty({ description: '公司类型', enum: CompanyType })
  @IsEnum(CompanyType)
  type: CompanyType;

  @ApiPropertyOptional({ description: '公司规模', enum: CompanyScale })
  @IsOptional()
  @IsEnum(CompanyScale)
  scale?: CompanyScale;

  @ApiProperty({ description: '国家' })
  @IsString()
  country: string;

  @ApiPropertyOptional({ description: '省份/州' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: '是否竞争对手' })
  @IsOptional()
  @IsBoolean()
  isCompetitor?: boolean;

  @ApiPropertyOptional({ description: '竞争级别' })
  @IsOptional()
  @IsString()
  competitorLevel?: string;

  @ApiPropertyOptional({ description: '代表游戏产品', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  games?: string[];

  @ApiPropertyOptional({ description: '官网' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'LinkedIn' })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: '标签', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({ description: '公司名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '英文名' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: '别名', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @ApiPropertyOptional({ description: '简称' })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional({ description: '公司类型', enum: CompanyType })
  @IsOptional()
  @IsEnum(CompanyType)
  type?: CompanyType;

  @ApiPropertyOptional({ description: '公司规模', enum: CompanyScale })
  @IsOptional()
  @IsEnum(CompanyScale)
  scale?: CompanyScale;

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

  @ApiPropertyOptional({ description: '是否竞争对手' })
  @IsOptional()
  @IsBoolean()
  isCompetitor?: boolean;

  @ApiPropertyOptional({ description: '竞争级别' })
  @IsOptional()
  @IsString()
  competitorLevel?: string;

  @ApiPropertyOptional({ description: '游戏产品', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  games?: string[];

  @ApiPropertyOptional({ description: '官网' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'LinkedIn' })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: '标签', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '是否活跃' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryCompaniesDto {
  @ApiPropertyOptional({ description: '公司名称（搜索）' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '公司类型', enum: CompanyType })
  @IsOptional()
  @IsEnum(CompanyType)
  type?: CompanyType;

  @ApiPropertyOptional({ description: '公司规模', enum: CompanyScale })
  @IsOptional()
  @IsEnum(CompanyScale)
  scale?: CompanyScale;

  @ApiPropertyOptional({ description: '国家' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: '是否竞争对手' })
  @IsOptional()
  @IsBoolean()
  isCompetitor?: boolean;

  @ApiPropertyOptional({ description: '页码', minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsInt()
  limit?: number;
}

// ============ Response DTOs ============

export class CompanyResponseDto {
  @ApiProperty({ description: '公司ID' })
  id: string;

  @ApiProperty({ description: '公司名称' })
  name: string;

  @ApiPropertyOptional({ description: '英文名' })
  nameEn?: string;

  @ApiPropertyOptional({ description: '别名', type: [String] })
  aliases?: string[];

  @ApiPropertyOptional({ description: '简称' })
  shortName?: string;

  @ApiProperty({ description: '公司类型', enum: CompanyType })
  type: CompanyType;

  @ApiPropertyOptional({ description: '公司规模', enum: CompanyScale })
  scale?: CompanyScale;

  @ApiProperty({ description: '国家' })
  country: string;

  @ApiPropertyOptional({ description: '省份' })
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  city?: string;

  @ApiProperty({ description: '是否竞争对手' })
  isCompetitor: boolean;

  @ApiPropertyOptional({ description: '竞争级别' })
  competitorLevel?: string;

  @ApiPropertyOptional({ description: '代表游戏产品', type: [String] })
  games?: string[];

  @ApiPropertyOptional({ description: '官网' })
  website?: string;

  @ApiPropertyOptional({ description: 'LinkedIn' })
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: '标签', type: [String] })
  tags?: string[];

  @ApiProperty({ description: '是否活跃' })
  isActive: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
