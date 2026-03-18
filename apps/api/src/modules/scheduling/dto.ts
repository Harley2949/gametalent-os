import { IsString, IsArray, IsOptional, IsInt, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TimeSlotDto {
  @ApiProperty({ description: '开始时间' })
  start: Date;

  @ApiProperty({ description: '结束时间' })
  end: Date;

  @ApiProperty({ description: '推荐分数 (0-100)' })
  score: number;

  @ApiProperty({ description: '推荐理由', type: [String] })
  reasons: string[];
}

export class GetScheduleSuggestionsDto {
  @ApiProperty({ description: '应聘ID' })
  @IsString()
  applicationId: string;

  @ApiProperty({ description: '面试官ID列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  interviewerIds: string[];

  @ApiProperty({ description: '面试时长（分钟）' })
  @IsInt()
  @Min(15)
  @Max(240)
  duration: number;

  @ApiPropertyOptional({ description: '搜索开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({ description: '搜索结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional({ description: '候选人时区' })
  @IsOptional()
  @IsString()
  candidateTimeZone?: string;

  @ApiPropertyOptional({ description: '偏好时段', type: [String], enum: ['morning', 'afternoon'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTimes?: string[];
}

export class UpdateUserAvailabilityDto {
  @ApiPropertyOptional({ description: '工作日 (1=周一, 7=周日)', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  workDays?: number[];

  @ApiPropertyOptional({ description: '工作开始时间 (HH:mm)' })
  @IsOptional()
  @IsString()
  workStartAt?: string;

  @ApiPropertyOptional({ description: '工作结束时间 (HH:mm)' })
  @IsOptional()
  @IsString()
  workEndAt?: string;

  @ApiPropertyOptional({ description: '午休开始时间 (HH:mm)' })
  @IsOptional()
  @IsString()
  breakStartAt?: string;

  @ApiPropertyOptional({ description: '午休结束时间 (HH:mm)' })
  @IsOptional()
  @IsString()
  breakEndAt?: string;

  @ApiPropertyOptional({ description: '时区' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: '最小预约提前时间（小时）' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minNoticeHours?: number;

  @ApiPropertyOptional({ description: '最大预约天数' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxBookingDays?: number;

  @ApiPropertyOptional({ description: '不可用日期列表', type: [Date] })
  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  blackoutDates?: Date[];
}

export class ScheduleInterviewDto {
  @ApiProperty({ description: '应聘ID' })
  @IsString()
  applicationId: string;

  @ApiProperty({ description: '面试官ID' })
  @IsString()
  interviewerId: string;

  @ApiProperty({ description: '面试标题' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '面试描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '面试类型', enum: ['PHONE_SCREEN', 'VIDEO', 'ONSITE', 'TECHNICAL', 'BEHAVIORAL', 'PANEL', 'TAKE_HOME'] })
  @IsString()
  type: string;

  @ApiProperty({ description: '面试阶段', enum: ['SCREENING', 'FIRST_ROUND', 'SECOND_ROUND', 'FINAL_ROUND', 'TECHNICAL', 'CULTURAL', 'EXECUTIVE'] })
  @IsString()
  stage: string;

  @ApiProperty({ description: '面试时间' })
  @IsDateString()
  scheduledAt: Date;

  @ApiProperty({ description: '面试时长（分钟）' })
  @IsInt()
  @Min(15)
  @Max(240)
  duration: number;

  @ApiPropertyOptional({ description: '面试地点或会议链接' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class RescheduleInterviewDto {
  @ApiProperty({ description: '新的面试时间' })
  @IsDateString()
  scheduledAt: Date;

  @ApiPropertyOptional({ description: '改期原因' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class GetAvailableSlotsDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '开始日期' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: '结束日期' })
  @IsDateString()
  endDate: Date;
}

export class AvailabilityResultDto {
  @ApiProperty({ description: '日期' })
  date: Date;

  @ApiProperty({ description: '该日的可用时段', type: [TimeSlotDto] })
  availableSlots: TimeSlotDto[];
}

export class UserAvailabilityDto {
  @ApiProperty({ description: '用户ID' })
  userId: string;

  @ApiProperty({ description: '工作日 (1=周一, 7=周日)', type: [Number] })
  workDays: number[];

  @ApiProperty({ description: '工作开始时间' })
  workStartAt: string;

  @ApiProperty({ description: '工作结束时间' })
  workEndAt: string;

  @ApiPropertyOptional({ description: '午休开始时间' })
  breakStartAt?: string;

  @ApiPropertyOptional({ description: '午休结束时间' })
  breakEndAt?: string;

  @ApiProperty({ description: '时区' })
  timezone: string;

  @ApiProperty({ description: '最小预约提前时间（小时）' })
  minNoticeHours: number;

  @ApiProperty({ description: '最大预约天数' })
  maxBookingDays: number;

  @ApiProperty({ description: '不可用日期列表', type: [Date] })
  blackoutDates: Date[];
}
