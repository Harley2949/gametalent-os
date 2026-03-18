import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ResumeStatus } from '@prisma/client';

/**
 * 上传简历 DTO
 */
export class UploadResumeDto {
  @ApiProperty({ description: '简历文件' })
  file: any;

  @ApiProperty({ description: '候选人ID（如果为空则自动创建）', required: false })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @ApiProperty({ description: '简历标题', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '是否设为主简历', default: false })
  @IsOptional()
  isPrimary?: boolean;
}

/**
 * 解析简历 DTO
 */
export class ParseResumeDto {
  @ApiProperty({ description: '简历ID' })
  @IsString()
  @IsNotEmpty()
  resumeId: string;

  @ApiProperty({ description: '是否强制重新解析', default: false })
  @IsOptional()
  force?: boolean;
}

/**
 * 批量上传简历 DTO
 */
export class BatchUploadResumeDto {
  @ApiProperty({ description: '简历文件列表' })
  @IsArray()
  files: any[];
}

/**
 * 获取解析状态 DTO
 */
export class GetParsingStatusDto {
  @ApiProperty({ description: '简历ID' })
  @IsString()
  @IsNotEmpty()
  resumeId: string;
}

/**
 * 解析结果响应
 */
export interface ParsedResumeResult {
  // 基本信息
  name: string;
  email: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  githubUrl?: string;

  // 职业信息
  currentTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  isCurrentlyEmployed?: boolean;

  // 技能（游戏行业特定）
  skills: {
    engines: Array<{ name: string; level: 'expert' | 'advanced' | 'intermediate' | 'basic' }>;
    languages: Array<{ name: string; level: 'expert' | 'advanced' | 'intermediate' | 'basic' }>;
    tools: string[];
    gameGenres?: string[];
    artStyles?: string[];
  };

  // 项目经验
  projects: Array<{
    name: string;
    role: string;
    status: 'released' | 'in-development' | 'testing';
    platform?: string[];
    description: string;
    achievements?: string[];
  }>;

  // 工作经历
  workExperience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
  }>;

  // 教育背景
  education: Array<{
    school: string;
    degree: string;
    major: string;
    level: string;
    startDate?: string;
    endDate?: string;
    isOverseas?: boolean;
  }>;

  // 逻辑疑点
  warnings: string[];
}

/**
 * 解析状态响应
 */
export interface ParsingStatusResponse {
  resumeId: string;
  status: ResumeStatus;
  progress: number;
  parsedData?: ParsedResumeResult;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}
