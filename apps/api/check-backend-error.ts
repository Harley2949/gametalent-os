import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkResumeUpload() {
  console.log('=== 检查简历上传相关数据 ===\n');
  
  // 检查是否有简历记录
  const resumes = await prisma.resume.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(`简历记录数量: ${resumes.length}`);
  
  await prisma.$disconnect();
}

checkResumeUpload().catch(console.error);
