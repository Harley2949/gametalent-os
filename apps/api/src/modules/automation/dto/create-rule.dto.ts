import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsObject } from 'class-validator';

export class CreateRuleDto {
  @ApiProperty({ description: '规则名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '规则描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否启用', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '规则类型' })
  @IsString()
  ruleType: string;

  @ApiProperty({ description: '触发条件' })
  @IsObject()
  triggerCondition: any;

  @ApiProperty({ description: '执行动作', required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  actions?: any[];

  @ApiProperty({ description: '适用的职位 ID', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appliesToJobs?: string[];
}
