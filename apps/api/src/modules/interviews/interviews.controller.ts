import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../auth';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@gametalent/db';
import {
  CreateInterviewDto,
  UpdateInterviewDto,
  QueryInterviewsDto,
  InterviewFeedbackDto,
} from './dto';

@ApiTags('interviews')
@Controller('interviews')
// @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // 临时移除认证要求
// @ApiBearerAuth()
export class InterviewsController {
  constructor(private interviewsService: InterviewsService) {}

  /**
   * 获取面试列表
   */
  @Get()
  // @RequirePermissions('interviews:view') // 临时移除权限要求
  @ApiOperation({ summary: '获取面试列表' })
  findAll(@Query() query: QueryInterviewsDto) {
    return this.interviewsService.findAll(query);
  }

  /**
   * 获取日历视图数据
   */
  @Get('calendar')
  @RequirePermissions('interviews:view')
  @ApiOperation({ summary: '获取日历视图数据' })
  getCalendarEvents(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interviewerId') interviewerId?: string,
  ) {
    return this.interviewsService.getCalendarEvents(
      new Date(startDate),
      new Date(endDate),
      interviewerId,
    );
  }

  /**
   * 获取面试统计
   */
  @Get('stats/summary')
  @RequirePermissions('interviews:view')
  @ApiOperation({ summary: '获取面试统计数据' })
  getStatistics(@Query('interviewerId') interviewerId?: string) {
    return this.interviewsService.getStatistics(interviewerId);
  }

  /**
   * 获取面试官的面试安排
   */
  @Get('schedule/:interviewerId')
  @RequirePermissions('interviews:view')
  @ApiOperation({ summary: '获取面试官的面试安排' })
  getInterviewerSchedule(
    @Param('interviewerId') interviewerId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.interviewsService.getInterviewerSchedule(
      interviewerId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * 获取面试详情
   */
  @Get(':id')
  @RequirePermissions('interviews:view')
  @ApiOperation({ summary: '获取面试详情' })
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  /**
   * 创建面试
   */
  @Post()
  // @RequirePermissions('interviews:create') // 临时移除权限要求
  @ApiOperation({ summary: '创建面试' })
  create(@Body() data: CreateInterviewDto) {
    return this.interviewsService.create(data);
  }

  /**
   * 更新面试信息
   */
  @Put(':id')
  @RequirePermissions('interviews:update')
  @ApiOperation({ summary: '更新面试信息' })
  update(@Param('id') id: string, @Body() data: UpdateInterviewDto) {
    return this.interviewsService.update(id, data);
  }

  /**
   * 删除面试
   */
  @Delete(':id')
  @RequirePermissions('interviews:delete')
  @ApiOperation({ summary: '删除面试' })
  remove(@Param('id') id: string) {
    return this.interviewsService.remove(id);
  }

  /**
   * 提交面试反馈
   */
  @Post(':id/feedback')
  @RequirePermissions('interviews:submitFeedback')
  @ApiOperation({ summary: '提交面试反馈' })
  submitFeedback(@Param('id') id: string, @Body() data: InterviewFeedbackDto, @Request() req) {
    return this.interviewsService.submitFeedback(id, data, req.user.userId);
  }

  /**
   * 更新面试反馈（仅管理员和招聘专员可操作）
   */
  @Put(':id/feedback')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: '更新面试反馈' })
  updateFeedback(@Param('id') id: string, @Body() data: InterviewFeedbackDto) {
    return this.interviewsService.updateFeedback(id, data);
  }
}
