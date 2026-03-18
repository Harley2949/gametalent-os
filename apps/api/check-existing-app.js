const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExisting() {
  const candidateId = 'cmmu8esw700066de6zl6op2mw';
  const jobId = 'cmmuaihhn0000cnwu34cpb0bj';
  
  console.log('检查应聘记录是否存在...');
  console.log('候选人ID:', candidateId);
  console.log('职位ID:', jobId);
  
  const existing = await prisma.application.findUnique({
    where: {
      jobId_candidateId: {
        jobId: jobId,
        candidateId: candidateId,
      },
    },
  });
  
  if (existing) {
    console.log('⚠️ 应聘记录已存在:', existing.id);
    console.log('   状态:', existing.status);
    console.log('   创建时间:', existing.createdAt);
  } else {
    console.log('✅ 应聘记录不存在，可以创建');
  }
  
  // 同时检查候选人是否存在
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { id: true, name: true, email: true },
  });
  console.log('\n候选人:', candidate ? '✅ 存在' : '❌ 不存在');
  if (candidate) console.log('  ', candidate.name, '-', candidate.email);
  
  // 检查职位是否存在
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, title: true, department: true },
  });
  console.log('\n职位:', job ? '✅ 存在' : '❌ 不存在');
  if (job) console.log('  ', job.title, '-', job.department);
  
  await prisma.$disconnect();
}

checkExisting();
