import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedApplications() {
  console.log('🌱 开始创建测试应聘数据...\n');

  try {
    // 检查现有数据
    const existingCount = await prisma.application.count();
    console.log(`现有应聘记录: ${existingCount} 条`);

    if (existingCount >= 12) {
      console.log('✅ 已有足够的应聘数据，无需创建');
      return;
    }

    // 获取候选人和职位
    const candidates = await prisma.candidate.findMany({ take: 10 });
    const jobs = await prisma.job.findMany({ take: 10 });

    console.log(`\n找到候选人: ${candidates.length} 个`);
    console.log(`找到职位: ${jobs.length} 个`);

    if (candidates.length === 0) {
      console.log('❌ 没有找到候选人，请先创建候选人数据');
      return;
    }

    if (jobs.length === 0) {
      console.log('❌ 没有找到职位，请先创建职位数据');
      return;
    }

    // 创建不同状态的应聘记录（使用正确的枚举值）
    const statuses = ['APPLIED', 'SCREENING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWING', 'INTERVIEW_PASSED', 'OFFERED', 'HIRED', 'REJECTED'];
    const sources = ['LINKEDIN', 'REFERRAL', 'DIRECT', 'AGENCY', 'UPLOAD'];

    const applications = [];
    for (let i = 0; i < 12; i++) {
      const candidate = candidates[i % candidates.length];
      const job = jobs[i % jobs.length];
      const status = statuses[i % statuses.length];
      const source = sources[i % sources.length];

      // 检查是否已存在
      const existing = await prisma.application.findFirst({
        where: {
          candidateId: candidate.id,
          jobId: job.id,
        }
      });

      if (!existing) {
        const daysAgo = Math.floor(Math.random() * 30);
        const application = await prisma.application.create({
          data: {
            candidateId: candidate.id,
            jobId: job.id,
            status: status as any,
            source: source as any,
            appliedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
            matchScore: Math.floor(Math.random() * 40) + 60,
          }
        });
        applications.push(application);
        console.log(`✓ 创建应聘记录 #${i + 1}: ${candidate.name} -> ${job.title} [${status}]`);
      }
    }

    console.log(`\n✅ 成功创建 ${applications.length} 条应聘记录!`);
    console.log('\n📊 状态分布:');
    const stats = await prisma.application.groupBy({
      by: ['status'],
      _count: true
    });
    stats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count} 条`);
    });

  } catch (error) {
    console.error('❌ 创建数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedApplications();
