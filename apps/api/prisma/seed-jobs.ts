import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建职位数据...');

  // 获取管理员用户
  const admin = await prisma.user.findFirst({
    where: { email: 'demo@test.com' },
  });

  if (!admin) {
    console.error('❌ 未找到管理员用户');
    return;
  }

  console.log('✅ 找到管理员用户:', admin.name);

  // 创建测试职位
  const jobs = [
    {
      title: '高级游戏客户端开发工程师',
      department: '技术部',
      description: '负责游戏客户端开发，使用Unity3D引擎',
      requirements: '3年以上游戏开发经验，熟练掌握Unity3D、C#',
      experienceLevel: 'SENIOR',
      status: 'ACTIVE',
      priority: 'HIGH',
      location: '北京',
      salaryMin: 25000,
      salaryMax: 40000,
      applicantCount: 0,
    },
    {
      title: '游戏UI设计师',
      department: '美术部',
      description: '负责游戏UI设计，使用Photoshop、Figma等工具',
      requirements: '2年以上UI设计经验，有游戏UI设计经验者优先',
      experienceLevel: 'MID',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      location: '上海',
      salaryMin: 15000,
      salaryMax: 25000,
      applicantCount: 0,
    },
    {
      title: '游戏服务器开发工程师',
      department: '技术部',
      description: '负责游戏服务器开发，使用C++、Go',
      requirements: '5年以上服务器开发经验，熟悉分布式系统',
      experienceLevel: 'SENIOR',
      status: 'ACTIVE',
      priority: 'HIGH',
      location: '深圳',
      salaryMin: 30000,
      salaryMax: 50000,
      applicantCount: 0,
    },
  ];

  for (const jobData of jobs) {
    const job = await prisma.job.upsert({
      where: {
        title_department: {
          title: jobData.title,
          department: jobData.department,
        },
      },
      update: {},
      create: {
        ...jobData,
        createdBy: admin.id,
      },
    });
    console.log('✅ 创建职位:', job.title, '-', job.department);
  }

  console.log('🎉 职位创建完成！');
}

main()
  .catch((e) => {
    console.error('❌ 创建职位失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
