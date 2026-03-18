import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CacheModule } from './modules/cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { AiModule } from './modules/ai/ai.module';
// import { WorkflowModule } from './modules/workflow/workflow.module';  // 暂时禁用
// import { AutomationModule } from './modules/automation/automation.module';  // 暂时禁用
import { ResumeUploadModule } from './modules/resume-upload/resume-upload.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';  // 智能面试排期模块
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { EducationModule } from './modules/education/education.module';
import { WorkExperienceModule } from './modules/work-experience/work-experience.module';
// import { CompanyModule } from './modules/company/company.module';  // 临时禁用
import { JobMatchModule } from './modules/job-match/job-match.module';
// import { NotificationsModule } from './modules/notifications/notifications.module';  // 临时禁用 - ConfigService 注入问题

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        '../../.env',  // 查找项目根目录的 .env
      ],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    CacheModule,
    AuthModule,
    UsersModule,
    CandidatesModule,
    JobsModule,
    ApplicationsModule,
    InterviewsModule,
    FeedbackModule,
    AiModule,
    // WorkflowModule,  // 暂时禁用
    // AutomationModule,  // 暂时禁用
    ResumeUploadModule,  // ✅ 已启用 - 修复了 pdf-parse 兼容性问题
    SchedulingModule,
    AnalyticsModule,
    EducationModule,
    WorkExperienceModule,
    // CompanyModule,  // 临时禁用
    JobMatchModule,
    // NotificationsModule,  // 临时禁用 - ConfigService 注入问题
  ],
})
export class AppModule {}
