import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsController } from './notifications.controller';
import { EmailService } from './email.service';
import { NotificationsSchedulerService } from './notifications-scheduler.service';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  controllers: [NotificationsController],
  providers: [EmailService, NotificationsSchedulerService],
  exports: [EmailService],
})
export class NotificationsModule {}
