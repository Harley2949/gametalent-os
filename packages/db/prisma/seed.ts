import { PrismaClient, ApplicationStatus, CandidateSource, JobStatus, JobType, WorkMode, ExperienceLevel, Priority } from '@prisma/client';
import { seedAuth } from '../src/seed-auth';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://gametalent:gametalent_password@localhost:5432/gametalent_os?schema=public'
    }
  }
});

async function main() {
  console.log('🌱 开始创建种子数据...\n');

  // 0. 初始化权限和角色
  console.log('0️⃣  初始化权限与角色...');
  await seedAuth();
  console.log('');

  // 1. 创建测试用户（如果不存在）
  console.log('1️⃣  创建测试用户...');
  let user = await prisma.user.findFirst({
    where: { email: 'test@gametalent.com' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@gametalent.com',
        name: '测试 HR',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // 简单的哈希密码
        role: 'RECRUITER',
        status: 'ACTIVE',
        department: '人力资源部',
        title: '招聘专员',
      },
    });
    console.log(`   ✅ 用户创建成功: ${user.name} (${user.email})\n`);
  } else {
    console.log(`   ℹ️  用户已存在: ${user.name} (${user.email})\n`);
  }

  // 2. 创建测试职位
  console.log('2️⃣  创建测试职位...');
  let job = await prisma.job.findFirst({
    where: { title: 'Unity 高级开发工程师' },
  });

  if (!job) {
    job = await prisma.job.create({
      data: {
        title: 'Unity 高级开发工程师',
        description: '我们正在寻找一位经验丰富的 Unity 开发工程师，负责游戏核心功能开发。',
        requirements: '3年以上 Unity 开发经验，熟悉 C#，有完整游戏项目经验。',
        responsibilities: '负责游戏核心模块开发、性能优化、技术方案设计。',
        status: JobStatus.PUBLISHED,
        type: JobType.FULL_TIME,
        workMode: WorkMode.HYBRID,
        experienceLevel: ExperienceLevel.SENIOR,
        priority: Priority.HIGH,
        salaryMin: 20000,
        salaryMax: 35000,
        salaryCurrency: 'CNY',
        location: '上海',
        department: '技术部',
        team: '客户端开发组',
        targetSkills: ['Unity', 'C#', 'Game Development', 'Shader Programming'],
        applicantCount: 0,
        interviewCount: 0,
        offerCount: 0,
        publishedAt: new Date(),
        createdBy: user.id,
        assignees: {
          connect: [{ id: user.id }],
        },
      },
    });
    console.log(`   ✅ 职位创建成功: ${job.title} (ID: ${job.id})\n`);
  } else {
    console.log(`   ℹ️  职位已存在: ${job.title} (ID: ${job.id})\n`);
  }

  // 3. 创建测试候选人
  console.log('3️⃣  创建测试候选人...');
  let candidate = await prisma.candidate.findFirst({
    where: { email: 'zhangsan@example.com' },
  });

  if (!candidate) {
    candidate = await prisma.candidate.create({
      data: {
        email: 'zhangsan@example.com',
        name: '张三',
        phoneNumber: '+86 138 0013 8000',
        status: 'ACTIVE',
        source: CandidateSource.CAREER_PAGE,
        location: '上海',
        currentCompany: '某游戏公司',
        currentTitle: 'Unity 开发工程师',
        expectedSalary: '25000-30000',
        noticePeriod: '1个月',
        yearsOfExperience: 5,
        tags: ['unity', 'csharp', 'game-dev', 'senior'],
        linkedinUrl: 'https://linkedin.com/in/zhangsan',
        githubUrl: 'https://github.com/zhangsan',
      },
    });
    console.log(`   ✅ 候选人创建成功: ${candidate.name} (${candidate.email})\n`);
  } else {
    console.log(`   ℹ️  候选人已存在: ${candidate.name} (${candidate.email})\n`);
  }

  // 4. 创建测试申请（状态设为 INTERVIEWING）
  console.log('4️⃣  创建测试申请...');
  let application = await prisma.application.findFirst({
    where: {
      jobId: job.id,
      candidateId: candidate.id,
    },
  });

  if (!application) {
    application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.id,
        status: ApplicationStatus.INTERVIEWING, // 关键：设置为面试中
        transparencyLevel: 'STANDARD',
        source: '官网投递',
        matchScore: 85.5, // 设置一个匹配分数
        matchDetails: {
          skillsMatch: 90,
          experienceMatch: 85,
          educationMatch: 80,
          recommendation: 'RECOMMEND',
          strengths: ['Unity 经验丰富', '有完整项目经验', '技术栈匹配'],
          gaps: ['缺少管理经验'],
          notes: '整体匹配度较高，建议安排技术面试',
        },
        screeningScore: 88.0,
        screeningNotes: '初筛通过，简历完整，技能匹配',
        appliedAt: new Date('2026-03-01'),
        firstResponseAt: new Date('2026-03-02'),
      },
    });
    console.log(`   ✅ 申请创建成功: ${application.id.substring(0, 8)}... (状态: ${application.status})\n`);
  } else {
    console.log(`   ℹ️  申请已存在: ${application.id.substring(0, 8)}... (状态: ${application.status})\n`);
  }

  // 5. 创建自动化规则
  console.log('5️⃣  创建自动化规则...');
  let rule = await prisma.processRule.findFirst({
    where: { name: '面试通过后自动推进到 Offer 阶段' },
  });

  if (!rule) {
    rule = await prisma.processRule.create({
      data: {
        name: '面试通过后自动推进到 Offer 阶段',
        description: '当申请状态变为 INTERVIEW_PASSED 时，自动将状态更新为 OFFERED 并模拟发送通知给 HR 和 Hiring Manager',
        isActive: true,
        ruleType: 'AUTO_ADVANCE',
        triggerCondition: {
          type: 'STATUS_EQUALS',
          value: 'INTERVIEW_PASSED',
        },
        actions: [
          {
            type: 'UPDATE_STATUS',
            params: {
              toStatus: 'OFFERED',
            },
          },
          {
            type: 'SEND_NOTIFICATION',
            params: {
              recipients: ['test@gametalent.com', 'hiring-manager@gametalent.com'],
              message: '候选人面试已通过，已自动推进到 Offer 阶段，请及时处理薪资谈判',
            },
          },
          {
            type: 'SEND_EMAIL',
            params: {
              to: 'test@gametalent.com',
              subject: '面试通过通知 - 张三 (Unity 高级开发工程师)',
              template: 'INTERVIEW_PASSED_TEMPLATE',
            },
          },
        ],
        appliesToJobs: [], // 空数组表示适用于所有职位
      },
    });
    console.log(`   ✅ 规则创建成功: ${rule.name} (ID: ${rule.id.substring(0, 8)}...)\n`);
  } else {
    console.log(`   ℹ️  规则已存在: ${rule.name} (ID: ${rule.id.substring(0, 8)}...)\n`);
  }

  // 6. 输出测试信息
  console.log('========================================');
  console.log('🎉 种子数据创建完成！');
  console.log('========================================\n');
  console.log('📋 测试数据信息:');
  console.log(`   用户: ${user.name} (${user.email})`);
  console.log(`   职位: ${job.title} (ID: ${job.id})`);
  console.log(`   候选人: ${candidate.name} (${candidate.email})`);
  console.log(`   申请: ${application.id} (状态: ${application.status})`);
  console.log(`   规则: ${rule.name}\n`);

  console.log('🔗 API 测试端点:');
  console.log(`   POST http://localhost:3001/api/automation/check/${application.id}\n`);

  console.log('💡 测试步骤:');
  console.log('   1. 先将申请状态从 INTERVIEWING 改为 INTERVIEW_PASSED');
  console.log('   2. 然后调用 /api/automation/check/:id 接口');
  console.log('   3. 观察规则自动执行和通知输出\n');

  console.log('✨ 完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
