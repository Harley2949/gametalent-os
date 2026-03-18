const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createJobs() {
  console.log('开始创建职位...');

  const admin = await prisma.user.findFirst({
    where: { email: 'demo@test.com' }
  });

  if (!admin) {
    console.error('未找到管理员用户');
    return;
  }

  const jobs = [
    {
      title: '游戏UI设计师',
      department: '美术部',
      description: '负责游戏UI设计，使用Photoshop、Figma等工具',
      responsibilities: '1. 游戏界面设计\n2. UI图标绘制\n3. 与策划团队协作',
      requirements: '2年以上UI设计经验，有游戏UI设计经验者优先',
      experienceLevel: 'MID',
      status: 'PUBLISHED',
      priority: 'MEDIUM',
      location: '上海',
      salaryMin: 15000,
      salaryMax: 25000,
      applicantCount: 0,
      creator: {
        connect: { id: admin.id }
      }
    },
    {
      title: '高级游戏客户端开发工程师',
      department: '技术部',
      description: '负责游戏客户端开发，使用Unity3D引擎',
      responsibilities: '1. 游戏客户端架构设计\n2. 核心功能开发\n3. 性能优化',
      requirements: '3年以上游戏开发经验，熟练掌握Unity3D、C#',
      experienceLevel: 'SENIOR',
      status: 'PUBLISHED',
      priority: 'HIGH',
      location: '北京',
      salaryMin: 25000,
      salaryMax: 40000,
      applicantCount: 0,
      creator: {
        connect: { id: admin.id }
      }
    }
  ];

  for (const jobData of jobs) {
    try {
      const job = await prisma.job.create({
        data: jobData
      });
      console.log('✅ 创建职位:', job.title, '- ID:', job.id);
    } catch (error) {
      console.error('❌ 创建职位失败:', error.message);
    }
  }

  await prisma.$disconnect();
  console.log('完成！');
}

createJobs().catch(console.error);
