const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDirectCreate() {
  try {
    console.log('🧪 测试直接创建应聘记录...');
    
    const candidateId = 'cmmu8esw700066de6zl6op2mw';
    const jobId = 'cmmuaihhn0000cnwu34cpb0bj';
    
    const application = await prisma.application.create({
      data: {
        jobId: jobId,
        candidateId: candidateId,
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
    
    console.log('✅ 直接创建成功！');
    console.log('   ID:', application.id);
    console.log('   职位:', application.job.title);
    console.log('   候选人:', application.candidate.name);
    console.log('   状态:', application.status);
    
    // 更新职位计数
    await prisma.job.update({
      where: { id: jobId },
      data: {
        applicantCount: {
          increment: 1,
        },
      },
    });
    
    console.log('✅ 职位计数已更新');
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
    console.error('   错误代码:', error.code);
    console.error('   错误详情:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectCreate();
