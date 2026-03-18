import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateProcessTemplateDto {
  @ApiProperty({ description: '流程模板名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '流程模板描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否启用', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '是否为默认模板', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: '适用的职位类型', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobTypes?: string[];
}
