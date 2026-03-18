import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService } from './email.service';
import {
  SendInterviewInviteDto,
  SendInterviewReminderDto,
  SendOfferDto,
  SendJobClosedDto,
  SendEmailDto,
} from './dto';

@ApiTags('通知管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * 发送面试邀请邮件
   */
  @Post('interview-invite')
  @ApiOperation({ summary: '发送面试邀请邮件' })
  @ApiResponse({ status: 200, description: '邮件发送成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async sendInterviewInvite(@Body() data: SendInterviewInviteDto) {
    const success = await this.emailService.sendInterviewInvite({
      candidateEmail: data.candidateEmail,
      candidateName: data.candidateName,
      interviewerName: data.interviewerName,
      jobTitle: data.jobTitle,
      interviewTitle: data.interviewTitle,
      scheduledAt: new Date(data.scheduledAt),
      duration: data.duration,
      location: data.location,
    });

    return {
      success,
      message: success ? '面试邀请邮件已发送' : '邮件发送失败',
    };
  }

  /**
   * 发送面试提醒邮件
   */
  @Post('interview-reminder')
  @ApiOperation({ summary: '发送面试提醒邮件' })
  @ApiResponse({ status: 200, description: '邮件发送成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async sendInterviewReminder(@Body() data: SendInterviewReminderDto) {
    const success = await this.emailService.sendInterviewReminder({
      candidateEmail: data.candidateEmail,
      candidateName: data.candidateName,
      jobTitle: data.jobTitle,
      interviewTitle: data.interviewTitle,
      scheduledAt: new Date(data.scheduledAt),
      location: data.location,
      hoursBefore: data.hoursBefore,
    });

    return {
      success,
      message: success ? '面试提醒邮件已发送' : '邮件发送失败',
    };
  }

  /**
   * 发送 Offer 邮件
   */
  @Post('offer')
  @ApiOperation({ summary: '发送 Offer 邮件' })
  @ApiResponse({ status: 200, description: '邮件发送成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async sendOffer(@Body() data: SendOfferDto) {
    const success = await this.emailService.sendOffer({
      candidateEmail: data.candidateEmail,
      candidateName: data.candidateName,
      jobTitle: data.jobTitle,
      companyName: data.companyName,
      salary: data.salary,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
    });

    return {
      success,
      message: success ? 'Offer 邮件已发送' : '邮件发送失败',
    };
  }

  /**
   * 发送职位关闭通知邮件
   */
  @Post('job-closed')
  @ApiOperation({ summary: '发送职位关闭通知邮件' })
  @ApiResponse({ status: 200, description: '邮件发送成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async sendJobClosed(@Body() data: SendJobClosedDto) {
    const success = await this.emailService.sendJobClosed({
      candidateEmail: data.candidateEmail,
      candidateName: data.candidateName,
      jobTitle: data.jobTitle,
      reason: data.reason,
    });

    return {
      success,
      message: success ? '职位关闭通知邮件已发送' : '邮件发送失败',
    };
  }

  /**
   * 通用邮件发送接口
   */
  @Post('send')
  @ApiOperation({ summary: '发送自定义邮件' })
  @ApiResponse({ status: 200, description: '邮件发送成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async sendEmail(@Body() data: SendEmailDto) {
    const success = await this.emailService.sendMail({
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });

    return {
      success,
      message: success ? '邮件已发送' : '邮件发送失败',
    };
  }
}
