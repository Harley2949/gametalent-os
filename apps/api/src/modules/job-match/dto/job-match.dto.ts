import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 计算职位匹配度 DTO
 */
export class CalculateMatchDto {
  @ApiProperty({ description: '候选人 ID' })
  @IsString()
  candidateId: string;

  @ApiProperty({ description: '职位 ID' })
  @IsString()
  jobId: string;
}

/**
 * 批量计算职位匹配度 DTO
 */
export class BatchCalculateMatchDto {
  @ApiProperty({ description: '职位 ID' })
  @IsString()
  jobId: string;

  @ApiProperty({ description: '候选人 ID 列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  candidateIds: string[];
}

/**
 * 技能提取 DTO
 */
export class ExtractSkillsDto {
  @ApiProperty({ description: '简历 ID' })
  @IsString()
  resumeId: string;
}

/**
 * 竞品分析 DTO
 */
export class AnalyzeCompetitorDto {
  @ApiProperty({ description: '简历 ID' })
  @IsString()
  resumeId: string;
}

/**
 * AI 提示词 DTO
 */
export class AiPromptDto {
  @ApiProperty({ description: '提示词内容' })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ description: '模型名称（默认使用配置的模型）' })
  @IsString()
  @IsOptional()
  model?: string;
}
