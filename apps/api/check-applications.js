const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApplications() {
  const applications = await prisma.application.findMany({
    include: {
      job: {
        select: { title: true, department: true },
      },
      candidate: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  console.log('📊 应聘记录列表（最新5条）：');
  console.log('==========================================');
  
  applications.forEach((app, index) => {
    console.log(`${index + 1}. ${app.candidate.name} → ${app.job.title}`);
    console.log(`   状态: ${app.status}`);
    console.log(`   创建时间: ${app.createdAt.toLocaleString('zh-CN')}`);
    console.log('');
  });

  console.log(`总计: ${applications.length} 条记录`);
  
  await prisma.$disconnect();
}

checkApplications();
