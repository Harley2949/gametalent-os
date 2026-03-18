import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsInt, IsEnum } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class CreateProcessNodeDto {
  @ApiProperty({ description: '节点名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '节点标签' })
  @IsString()
  label: string;

  @ApiProperty({ description: '节点描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '对应的应用状态', enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  stage: ApplicationStatus;

  @ApiProperty({ description: '节点顺序' })
  @IsInt()
  order: number;

  @ApiProperty({ description: '是否必需', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ description: '必需字段', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredFields?: string[];

  @ApiProperty({ description: '是否自动推进', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  autoAdvance?: boolean;

  @ApiProperty({ description: '自动推进规则', required: false })
  @IsOptional()
  autoAdvanceRule?: any;

  @ApiProperty({ description: '是否通知候选人', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  notifyCandidate?: boolean;

  @ApiProperty({ description: '是否通知面试官', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  notifyInterviewers?: boolean;

  @ApiProperty({ description: '通知模板', required: false })
  @IsOptional()
  notificationTemplates?: any;
}
