const { PrismaClient } = require('@gametalent/db');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始快速创建测试数据...\n');

  // 1. 获取测试用户
  const demoUser = await prisma.user.findFirst({
    where: { email: 'demo@test.com' },
  });

  if (!demoUser) {
    console.log('❌ 请先运行基础种子脚本');
    return;
  }

  console.log('✅ 找到测试用户:', demoUser.name);

  // 2. 创建职位
  console.log('\n2️⃣  创建职位...');
  const job1 = await prisma.job.upsert({
    where: { id: 'job-game-dev-001' },
    update: {},
    create: {
      id: 'job-game-dev-001',
      title: '资深游戏客户端开发工程师',
      description: '负责Unity3D游戏客户端开发',
      department: '技术部',
      location: '北京',
      type: 'FULL_TIME',
      status: 'PUBLISHED',
      experienceLevel: 'SENIOR',
      priority: 'HIGH',
      salaryMin: 25000,
      salaryMax: 40000,
      requirements: '5年以上Unity3D开发经验',
      responsibilities: '负责游戏客户端核心功能开发',
      createdBy: demoUser.id,
    },
  });

  const job2 = await prisma.job.upsert({
    where: { id: 'job-ui-design-001' },
    update: {},
    create: {
      id: 'job-ui-design-001',
      title: '游戏UI设计师',
      description: '负责游戏界面设计',
      department: '美术部',
      location: '上海',
      type: 'FULL_TIME',
      status: 'PUBLISHED',
      experienceLevel: 'MID',
      priority: 'MEDIUM',
      salaryMin: 15000,
      salaryMax: 25000,
      requirements: '3年以上UI设计经验',
      responsibilities: '设计游戏界面，优化用户体验',
      createdBy: demoUser.id,
    },
  });

  console.log('   ✅ 创建了 2 个职位');

  // 3. 清理旧测试数据
  console.log('\n3️⃣  清理旧测试数据...');
  await prisma.interview.deleteMany({
    where: { id: { startsWith: 'test-' } }
  });
  await prisma.application.deleteMany({
    where: { id: { startsWith: 'test-' } }
  });
  await prisma.candidate.deleteMany({
    where: { id: { startsWith: 'test-' } }
  });
  console.log('   ✅ 旧数据已清理');

  // 4. 创建候选人
  console.log('\n4️⃣  创建候选人...');
  const candidates = await prisma.candidate.createMany({
    data: [
      {
        id: 'test-candidate-001',
        name: '张伟',
        email: 'zhangwei@test.com',
        phoneNumber: '13800138001',
        status: 'ACTIVE',
        source: 'LINKEDIN',
        location: '北京',
        currentCompany: '腾讯游戏',
        currentTitle: '高级游戏客户端开发工程师',
        expectedSalary: '35-45K',
        noticePeriod: '1个月',
        yearsOfExperience: 8,
        tags: ['Unity3D', 'C#', '游戏开发', '客户端'],
      },
      {
        id: 'test-candidate-002',
        name: '李娜',
        email: 'lina@test.com',
        phoneNumber: '13800138002',
        status: 'ACTIVE',
        source: 'REFERRAL',
        location: '上海',
        currentCompany: '米哈游',
        currentTitle: '游戏UI设计师',
        expectedSalary: '25-35K',
        noticePeriod: '2周',
        yearsOfExperience: 5,
        tags: ['UI设计', 'Photoshop', 'Figma', '游戏美术'],
      },
      {
        id: 'test-candidate-003',
        name: '王强',
        email: 'wangqiang@test.com',
        phoneNumber: '13800138003',
        status: 'ACTIVE',
        source: 'DIRECT',
        location: '深圳',
        currentCompany: '网易游戏',
        currentTitle: '游戏服务器开发工程师',
        expectedSalary: '40-50K',
        noticePeriod: '1个月',
        yearsOfExperience: 10,
        tags: ['C++', '服务器开发', '分布式系统', '网络编程'],
      },
      {
        id: 'test-candidate-004',
        name: '刘颖',
        email: 'liuying@test.com',
        phoneNumber: '13800138004',
        status: 'ACTIVE',
        source: 'UPLOAD',
        location: '北京',
        currentCompany: '字节跳动',
        currentTitle: '游戏技术美术',
        expectedSalary: '20-30K',
        noticePeriod: '2周',
        yearsOfExperience: 3,
        tags: ['Unity', 'Shader', 'VFX', '技术美术'],
      },
      {
        id: 'test-candidate-005',
        name: '陈浩',
        email: 'chenhao@test.com',
        phoneNumber: '13800138005',
        status: 'ACTIVE',
        source: 'LIEPIN',
        location: '杭州',
        currentCompany: '完美世界',
        currentTitle: '资深游戏策划',
        expectedSalary: '30-40K',
        noticePeriod: '1个月',
        yearsOfExperience: 6,
        tags: ['游戏策划', '系统设计', '数值策划', 'Unity'],
      },
    ],
  });

  console.log(`   ✅ 创建了 ${candidates.count} 个候选人`);

  // 5. 创建应聘记录
  console.log('\n5️⃣  创建应聘记录...');
  const applications = await prisma.application.createMany({
    data: [
      {
        id: 'test-app-001',
        candidateId: 'test-candidate-001',
        jobId: job1.id,
        status: 'INTERVIEWING',
        source: 'DIRECT',
        transparencyLevel: 'STANDARD',
      },
      {
        id: 'test-app-002',
        candidateId: 'test-candidate-002',
        jobId: job2.id,
        status: 'APPLIED',
        source: 'DIRECT',
        transparencyLevel: 'STANDARD',
      },
      {
        id: 'test-app-003',
        candidateId: 'test-candidate-003',
        jobId: job1.id,
        status: 'ACTIVE',
        source: 'DIRECT',
        transparencyLevel: 'STANDARD',
      },
      {
        id: 'test-app-004',
        candidateId: 'test-candidate-004',
        jobId: job2.id,
        status: 'SHORTLISTED',
        source: 'DIRECT',
        transparencyLevel: 'STANDARD',
      },
      {
        id: 'test-app-005',
        candidateId: 'test-candidate-005',
        jobId: job1.id,
        status: 'SHORTLISTED',
        source: 'DIRECT',
        transparencyLevel: 'STANDARD',
      },
    ],
  });

  console.log(`   ✅ 创建了 ${applications.count} 个应聘记录`);

  // 6. 创建面试记录
  console.log('\n6️⃣  创建面试记录...');
  const now = new Date();
  const interviews = await prisma.interview.createMany({
    data: [
      {
        id: 'test-interview-001',
        applicationId: 'test-app-001',
        interviewerId: demoUser.id,
        title: '技术面试 - Unity3D开发',
        type: 'VIDEO',
        stage: 'TECHNICAL',
        status: 'COMPLETED',
        scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        duration: 60,
        score: 8,
        notes: '技术扎实，项目经验丰富',
        description: '面试评估：Unity3D技术',
        feedback: {
          pros: ['Unity3D经验丰富', '项目架构能力强'],
          cons: ['对某些优化细节不够熟悉'],
          tags: ['技术强', '推荐录用'],
        },
      },
      {
        id: 'test-interview-002',
        applicationId: 'test-app-002',
        interviewerId: demoUser.id,
        title: 'UI设计作品展示',
        type: 'VIDEO',
        stage: 'PORTFOLIO',
        status: 'SCHEDULED',
        scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        duration: 60,
        notes: '准备查看作品集',
        description: 'UI设计作品集展示',
      },
      {
        id: 'test-interview-003',
        applicationId: 'test-app-003',
        interviewerId: demoUser.id,
        title: '服务器架构面试',
        type: 'ONSITE',
        stage: 'TECHNICAL',
        status: 'COMPLETED',
        scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        duration: 90,
        score: 9,
        notes: '架构能力强，有丰富经验',
        description: '服务器架构设计面试',
        feedback: {
          pros: ['架构能力强', '项目经验丰富'],
          cons: ['期望薪资较高'],
          tags: ['高级人才', '推荐录用'],
        },
      },
    ],
  });

  console.log(`   ✅ 创建了 ${interviews.count} 个面试记录`);

  console.log('\n✨ 测试数据创建完成！\n');
  console.log('📊 数据统计：');
  console.log(`   职位: 2 个`);
  console.log(`   候选人: 5 个`);
  console.log(`   应聘记录: 5 个`);
  console.log(`   面试记录: 3 个`);
  console.log('\n🎉 现在可以在前端查看测试数据了！\n');
}

main()
  .catch((e) => {
    console.error('❌ 创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
