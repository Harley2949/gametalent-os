const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreateApplication() {
  try {
    // 获取第一个候选人
    const candidate = await prisma.candidate.findFirst();
    console.log('✅ 找到候选人:', candidate.name, '-', candidate.email);

    // 获取第一个职位
    const job = await prisma.job.findFirst();
    console.log('✅ 找到职位:', job.title, '-', job.department);

    // 检查是否已存在应聘记录
    const existing = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: job.id,
          candidateId: candidate.id,
        },
      },
    });

    if (existing) {
      console.log('⚠️ 应聘记录已存在');
      return;
    }

    // 创建应聘记录
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.id,
        status: 'APPLIED',
        source: 'DIRECT',
        transparencyLevel: 'STANDARD',
      },
      include: {
        job: {
          select: { id: true, title: true, status: true },
        },
        candidate: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    console.log('✅ 应聘记录创建成功！');
    console.log('   职位:', application.job.title);
    console.log('   候选人:', application.candidate.name);
    console.log('   状态:', application.status);

    // 更新职位应聘计数
    await prisma.job.update({
      where: { id: job.id },
      data: {
        applicantCount: {
          increment: 1,
        },
      },
    });

    console.log('✅ 职位应聘计数已更新');
  } catch (error) {
    console.error('❌ 创建应聘记录失败:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testCreateApplication();
