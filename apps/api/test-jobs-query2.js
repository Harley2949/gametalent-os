const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testJobsQuery() {
  try {
    console.log('测试查询jobs（带assignees）...');
    const jobs = await prisma.job.findMany({
      skip: 0,
      take: 1,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignees: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    console.log('✅ 查询成功，找到', jobs.length, '个职位');
    console.log('职位:', jobs[0]?.title);
    console.log('Assignees:', jobs[0]?.assignees);
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testJobsQuery();
