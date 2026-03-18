import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulingService } from './scheduling.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('scheduling')
@Controller('scheduling')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  /**
   * Get schedule suggestions for an interview
   * POST /scheduling/suggestions
   */
  @Post('suggestions')
  @ApiOperation({ summary: '获取智能排期建议' })
  async getSuggestions(@Body() data: {
    applicationId: string;
    interviewerIds: string[];
    duration: number;
    startDate?: Date;
    endDate?: Date;
    candidateTimeZone?: string;
    preferredTimes?: string[];
  }) {
    return this.schedulingService.getScheduleSuggestions(data);
  }

  /**
   * Get user availability configuration
   * GET /scheduling/availability/:userId
   */
  @Get('availability/:userId')
  @ApiOperation({ summary: '获取用户可用时间配置' })
  async getUserAvailability(@Param('userId') userId: string) {
    return this.schedulingService.getUserAvailability(userId);
  }

  /**
   * Update user availability configuration
   * PUT /scheduling/availability/:userId
   */
  @Put('availability/:userId')
  @ApiOperation({ summary: '更新用户可用时间配置' })
  async updateUserAvailability(
    @Param('userId') userId: string,
    @Body() data: any,
  ) {
    return this.schedulingService.updateUserAvailability(userId, data);
  }

  /**
   * Get available slots for a date range
   * GET /scheduling/slots/:userId?startDate=&endDate=
   */
  @Get('slots/:userId')
  @ApiOperation({ summary: '获取用户在指定日期范围内的空闲时段' })
  async getAvailableSlots(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.schedulingService.getAvailableSlots(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Confirm and create interview with selected time slot
   * POST /scheduling/schedule
   */
  @Post('schedule')
  @ApiOperation({ summary: '确认并创建面试' })
  async scheduleInterview(@Body() data: {
    applicationId: string;
    interviewerIds: string[];
    scheduledAt: Date;
    duration: number;
    location?: string;
    title?: string;
    description?: string;
  }) {
    return this.schedulingService.confirmInterview(data);
  }

  /**
   * Get interview invitation status
   * GET /scheduling/interview/:interviewId/invitation
   */
  @Get('interview/:interviewId/invitation')
  @ApiOperation({ summary: '获取面试邀请状态' })
  async getInterviewInvitation(@Param('interviewId') interviewId: string) {
    return this.schedulingService.getInterviewInvitation(interviewId);
  }

  /**
   * Reschedule an existing interview
   * POST /scheduling/reschedule/:interviewId
   */
  @Post('reschedule/:interviewId')
  @ApiOperation({ summary: '改期 - 重新安排面试时间' })
  async rescheduleInterview(
    @Param('interviewId') interviewId: string,
    @Body() data: {
      scheduledAt: Date;
    },
  ) {
    return this.schedulingService.rescheduleInterview(interviewId, data.scheduledAt);
  }

  /**
   * Sync external calendar (Google, Outlook, etc.)
   * POST /scheduling/calendar/sync/:userId
   */
  @Post('calendar/sync/:userId')
  @ApiOperation({ summary: '同步外部日历' })
  async syncCalendar(
    @Param('userId') userId: string,
    @Body() data: { provider: string },
  ) {
    return this.schedulingService.syncExternalCalendar(userId, data.provider);
  }
}
