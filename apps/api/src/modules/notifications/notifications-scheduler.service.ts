import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { InterviewStatus } from '@prisma/client';

/**
 * 通知调度服务
 * 负责定时检查并发送面试提醒等通知
 */
@Injectable()
export class NotificationsSchedulerService {
  private readonly logger = new Logger(NotificationsSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * 每小时检查一次，发送24小时内开始的面试提醒
   * 每天凌晨 0:05、1:05、2:05 ... 执行
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'send-interview-reminders',
    timeZone: 'Asia/Shanghai',
  })
  async sendInterviewReminders() {
    try {
      this.logger.log('Starting interview reminder check...');

      // 计算时间范围：当前时间到24小时后
      const now = new Date();
      const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // 查找24小时内即将开始的面试
      const upcomingInterviews = await this.prisma.interview.findMany({
        where: {
          status: InterviewStatus.SCHEDULED,
          scheduledAt: {
            gte: now,
            lte: twentyFourHoursLater,
          },
        },
        include: {
          application: {
            include: {
              candidate: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              job: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          interviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Found ${upcomingInterviews.length} upcoming interviews`);

      // 为每个面试发送提醒
      let sentCount = 0;
      for (const interview of upcomingInterviews) {
        const { candidate, job } = interview.application;

        // 计算距离面试还有多少小时
        const hoursUntilInterview = Math.floor(
          (interview.scheduledAt.getTime() - now.getTime()) / (60 * 60 * 1000),
        );

        // 只在特定时间点发送提醒：24小时前、1小时前
        const shouldSend =
          hoursUntilInterview === 24 || hoursUntilInterview === 1;

        if (!shouldSend) {
          continue;
        }

        this.logger.log(
          `Sending reminder to ${candidate.email} for interview in ${hoursUntilInterview} hours`,
        );

        const success = await this.emailService.sendInterviewReminder({
          candidateEmail: candidate.email,
          candidateName: candidate.name,
          jobTitle: job.title,
          interviewTitle: interview.title,
          scheduledAt: interview.scheduledAt,
          location: interview.location,
          hoursBefore: hoursUntilInterview,
        });

        if (success) {
          sentCount++;
          this.logger.log(
            `Reminder sent to ${candidate.email} for interview ${interview.id}`,
          );
        } else {
          this.logger.error(
            `Failed to send reminder to ${candidate.email} for interview ${interview.id}`,
          );
        }
      }

      this.logger.log(
        `Interview reminder check completed. Sent ${sentCount} reminders.`,
      );
    } catch (error) {
      this.logger.error('Error in interview reminder scheduler:', error);
    }
  }

  /**
   * 每天早上9点检查今天开始的面试，发送提醒
   */
  @Cron('0 9 * * *', {
    name: 'daily-interview-reminders',
    timeZone: 'Asia/Shanghai',
  })
  async sendDailyInterviewReminders() {
    try {
      this.logger.log('Starting daily interview reminder check...');

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // 查找今天的面试
      const todayInterviews = await this.prisma.interview.findMany({
        where: {
          status: InterviewStatus.SCHEDULED,
          scheduledAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          application: {
            include: {
              candidate: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              job: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`Found ${todayInterviews.length} interviews scheduled for today`);

      // 发送提醒
      let sentCount = 0;
      for (const interview of todayInterviews) {
        const { candidate, job } = interview.application;

        const success = await this.emailService.sendInterviewReminder({
          candidateEmail: candidate.email,
          candidateName: candidate.name,
          jobTitle: job.title,
          interviewTitle: interview.title,
          scheduledAt: interview.scheduledAt,
          location: interview.location,
        });

        if (success) {
          sentCount++;
          this.logger.log(
            `Daily reminder sent to ${candidate.email} for interview ${interview.id}`,
          );
        }
      }

      this.logger.log(
        `Daily interview reminder check completed. Sent ${sentCount} reminders.`,
      );
    } catch (error) {
      this.logger.error('Error in daily interview reminder scheduler:', error);
    }
  }
}
