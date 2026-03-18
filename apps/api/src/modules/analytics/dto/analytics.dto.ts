import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 招聘漏斗分析查询参数
 */
export class FunnelQueryDto {
  @ApiProperty({ description: '职位 ID（可选，不传则查询所有职位）' })
  @IsString()
  @IsOptional()
  jobId?: string;

  @ApiPropertyOptional({ description: '开始日期（格式：YYYY-MM-DD，默认为30天前）' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期（格式：YYYY-MM-DD，默认为今天）' })
  @IsString()
  @IsOptional()
  endDate?: string;
}

/**
 * 转化率分析查询参数
 */
export class ConversionQueryDto {
  @ApiProperty({ description: '职位 ID（可选）' })
  @IsString()
  @IsOptional()
  jobId?: string;

  @ApiPropertyOptional({ description: '开始日期（格式：YYYY-MM-DD，默认为30天前）' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期（格式：YYYY-MM-DD，默认为今天）' })
  @IsString()
  @IsOptional()
  endDate?: string;
}

/**
 * 时间周期分析查询参数
 */
export class TimeCycleQueryDto {
  @ApiProperty({ description: '职位 ID（可选）' })
  @IsString()
  @IsOptional()
  jobId?: string;

  @ApiPropertyOptional({ description: '开始日期（格式：YYYY-MM-DD，默认为30天前）' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期（格式：YYYY-MM-DD，默认为今天）' })
  @IsString()
  @IsOptional()
  endDate?: string;
}

/**
 * 来源分析查询参数
 */
export class SourceQueryDto {
  @ApiPropertyOptional({ description: '开始日期（格式：YYYY-MM-DD，默认为30天前）' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期（格式：YYYY-MM-DD，默认为今天）' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: '最小候选人数量' })
  @IsString()
  @IsOptional()
  minCandidates?: string;
}
