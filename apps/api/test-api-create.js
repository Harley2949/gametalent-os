const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApiCreate() {
  try {
    // 获取一个新的职位ID（不是已使用的）
    const jobs = await prisma.job.findMany({
      select: { id: true, title: true },
      take: 10,
    });
    
    console.log('可用职位:');
    jobs.forEach((job, i) => {
      console.log(`  ${i + 1}. ${job.title} (${job.id})`);
    });
    
    // 获取候选人
    const candidates = await prisma.candidate.findMany({
      select: { id: true, name: true },
      take: 5,
    });
    
    console.log('\n可用候选人:');
    candidates.forEach((cand, i) => {
      console.log(`  ${i + 1}. ${cand.name} (${cand.id})`);
    });
    
    // 检查已有的应聘记录
    const applications = await prisma.application.findMany({
      select: {
        jobId: true,
        candidateId: true,
      },
      take: 10,
    });
    
    console.log('\n已有应聘记录组合:');
    applications.forEach(app => {
      console.log(`  - ${app.jobId} + ${app.candidateId}`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('错误:', error.message);
  }
}

testApiCreate();
