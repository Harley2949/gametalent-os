import { IsString, IsOptional, IsDateString, IsInt, IsEmail, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 发送面试邀请 DTO
 */
export class SendInterviewInviteDto {
  @ApiProperty({ description: '候选人邮箱' })
  @IsEmail()
  candidateEmail: string;

  @ApiProperty({ description: '候选人姓名' })
  @IsString()
  candidateName: string;

  @ApiProperty({ description: '面试官姓名' })
  @IsString()
  interviewerName: string;

  @ApiProperty({ description: '职位标题' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ description: '面试标题' })
  @IsString()
  interviewTitle: string;

  @ApiProperty({ description: '面试时间' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ description: '面试时长（分钟）' })
  @IsInt()
  @Min(15)
  @Max(480)
  duration: number;

  @ApiPropertyOptional({ description: '面试地点或会议链接' })
  @IsOptional()
  @IsString()
  location?: string;
}

/**
 * 发送面试提醒 DTO
 */
export class SendInterviewReminderDto {
  @ApiProperty({ description: '候选人邮箱' })
  @IsEmail()
  candidateEmail: string;

  @ApiProperty({ description: '候选人姓名' })
  @IsString()
  candidateName: string;

  @ApiProperty({ description: '职位标题' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ description: '面试标题' })
  @IsString()
  interviewTitle: string;

  @ApiProperty({ description: '面试时间' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ description: '面试地点或会议链接' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '提前多少小时提醒' })
  @IsOptional()
  @IsInt()
  @Min(1)
  hoursBefore?: number;
}

/**
 * 发送 Offer DTO
 */
export class SendOfferDto {
  @ApiProperty({ description: '候选人邮箱' })
  @IsEmail()
  candidateEmail: string;

  @ApiProperty({ description: '候选人姓名' })
  @IsString()
  candidateName: string;

  @ApiProperty({ description: '职位标题' })
  @IsString()
  jobTitle: string;

  @ApiPropertyOptional({ description: '公司名称' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: '薪资' })
  @IsOptional()
  @IsString()
  salary?: string;

  @ApiPropertyOptional({ description: '入职日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;
}

/**
 * 发送职位关闭通知 DTO
 */
export class SendJobClosedDto {
  @ApiProperty({ description: '候选人邮箱' })
  @IsEmail()
  candidateEmail: string;

  @ApiProperty({ description: '候选人姓名' })
  @IsString()
  candidateName: string;

  @ApiProperty({ description: '职位标题' })
  @IsString()
  jobTitle: string;

  @ApiPropertyOptional({ description: '关闭原因' })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * 通用邮件发送 DTO
 */
export class SendEmailDto {
  @ApiProperty({ description: '收件人邮箱（支持多个）' })
  @IsEmail()
  to: string;

  @ApiProperty({ description: '邮件主题' })
  @IsString()
  subject: string;

  @ApiProperty({ description: '邮件内容（HTML）' })
  @IsString()
  html: string;

  @ApiPropertyOptional({ description: '纯文本内容' })
  @IsOptional()
  @IsString()
  text?: string;
}
