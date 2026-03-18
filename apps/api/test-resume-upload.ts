import { PrismaClient } from '@prisma/client';
import { CandidateSource, CandidateStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function testResumeUpload() {
  try {
    console.log('=== 测试简历上传流程 ===\n');
    
    // 1. 创建测试候选人
    const candidate = await prisma.candidate.create({
      data: {
        email: 'resume-test@example.com',
        name: '简历测试用户',
        phoneNumber: '13900000000',
        source: CandidateSource.UPLOAD,
        status: CandidateStatus.ACTIVE,
      },
    });
    
    console.log('✅ 候选人创建成功:', candidate.id);
    
    // 2. 创建简历记录
    const resume = await prisma.resume.create({
      data: {
        candidateId: candidate.id,
        title: '测试简历.txt',
        fileName: 'test-resume.txt',
        fileUrl: '/uploads/test-resume.txt',
        fileSize: 1024,
        fileType: 'text/plain',
        rawData: '这是测试简历内容',
        rawText: '这是测试简历内容',
        parsedData: {},
        skills: [],
        status: 'READY',
        isPrimary: true,
      },
    });
    
    console.log('✅ 简历创建成功:', resume.id);
    console.log('\n简历上传测试通过！');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ 测试失败:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testResumeUpload();
