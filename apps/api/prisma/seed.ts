import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始数据库初始化...\n');

  // 1. 创建角色
  console.log('1️⃣  创建角色...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: '系统管理员',
      isSystem: true,
    },
  });

  const hrRole = await prisma.role.upsert({
    where: { name: 'HR' },
    update: {},
    create: {
      name: 'HR',
      description: '人力资源',
      isSystem: true,
    },
  });

  const interviewerRole = await prisma.role.upsert({
    where: { name: 'INTERVIEWER' },
    update: {},
    create: {
      name: 'INTERVIEWER',
      description: '面试官',
      isSystem: true,
    },
  });

  console.log('✅ 角色创建完成:', { adminRole, hrRole, interviewerRole });

  // 1.5 为ADMIN角色添加所有权限
  console.log('\n1️⃣.5️⃣  为ADMIN角色添加权限...');
  const allPermissions = [
    { name: 'candidates:view', resource: 'candidates', action: 'view' },
    { name: 'candidates:create', resource: 'candidates', action: 'create' },
    { name: 'candidates:update', resource: 'candidates', action: 'update' },
    { name: 'candidates:delete', resource: 'candidates', action: 'delete' },
    { name: 'jobs:view', resource: 'jobs', action: 'view' },
    { name: 'jobs:create', resource: 'jobs', action: 'create' },
    { name: 'jobs:update', resource: 'jobs', action: 'update' },
    { name: 'jobs:delete', resource: 'jobs', action: 'delete' },
    { name: 'applications:view', resource: 'applications', action: 'view' },
    { name: 'applications:update', resource: 'applications', action: 'update' },
    { name: 'interviews:view', resource: 'interviews', action: 'view' },
    { name: 'analytics:view', resource: 'analytics', action: 'view' },
  ];

  for (const permData of allPermissions) {
    const permission = await prisma.permission.upsert({
      where: { name: permData.name },
      update: {},
      create: {
        name: permData.name,
        description: `${permData.resource}:${permData.action}`,
        resource: permData.resource,
        action: permData.action,
      },
    });

    // 创建角色-权限关联
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log('✅ 权限添加完成');

  // 2. 创建测试用户
  console.log('\n2️⃣  创建测试用户...');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@test.com' },
    update: {},
    create: {
      email: 'demo@test.com',
      name: 'Demo User',
      password: '$2b$10$4XKI5kLUsHIyxTRJF3MVBeGGU00jAml3/2Sv6b82TtrQGr9ytVtCm', // demo123
      role: 'ADMIN',
      status: 'ACTIVE',
      department: '技术部',
      title: '系统管理员',
    },
  });

  console.log('✅ 测试用户创建完成:', demoUser);
  console.log('\n📝 测试账号信息:');
  console.log('   邮箱: demo@test.com');
  console.log('   密码: demo123');
  console.log('   角色: ADMIN');

  // 3. 创建职位数据
  console.log('\n3️⃣  创建职位数据...');
  const jobs = await Promise.all([
    prisma.job.upsert({
      where: { id: 'job-001' },
      update: {},
      create: {
        id: 'job-001',
        title: '资深游戏客户端开发工程师',
        description: '负责Unity3D游戏客户端开发和维护',
        department: '技术部',
        location: '北京',
        type: 'FULL_TIME',
        status: 'PUBLISHED',
        experienceLevel: 'SENIOR',
        priority: 'HIGH',
        salaryMin: 25000,
        salaryMax: 40000,
        requirements: '5年以上Unity3D开发经验，熟悉C#，有完整项目经验',
        responsibilities: '负责游戏客户端核心功能开发和性能优化',
        createdBy: demoUser.id,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-002' },
      update: {},
      create: {
        id: 'job-002',
        title: '游戏服务器开发工程师',
        description: '负责游戏服务器端开发和架构设计',
        department: '技术部',
        location: '上海',
        type: 'FULL_TIME',
        status: 'PUBLISHED',
        experienceLevel: 'MID',
        priority: 'MEDIUM',
        salaryMin: 20000,
        salaryMax: 35000,
        requirements: '3年以上服务器开发经验，熟悉Go/Python，有高并发经验',
        responsibilities: '设计和实现游戏服务器架构，保证系统稳定性',
        createdBy: demoUser.id,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-003' },
      update: {},
      create: {
        id: 'job-003',
        title: '游戏UI设计师',
        description: '负责游戏界面设计和交互设计',
        department: '美术部',
        location: '深圳',
        type: 'FULL_TIME',
        status: 'PUBLISHED',
        experienceLevel: 'MID',
        priority: 'MEDIUM',
        salaryMin: 15000,
        salaryMax: 25000,
        requirements: '3年以上UI设计经验，熟悉Figma、Photoshop，有游戏项目经验',
        responsibilities: '设计游戏界面，优化用户体验',
        createdBy: demoUser.id,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-004' },
      update: {},
      create: {
        id: 'job-004',
        title: '游戏技术美术',
        description: '负责游戏特效和美术资源制作',
        department: '美术部',
        location: '北京',
        type: 'FULL_TIME',
        status: 'PUBLISHED',
        experienceLevel: 'MID',
        priority: 'LOW',
        salaryMin: 18000,
        salaryMax: 30000,
        requirements: '2年以上技术美术经验，熟悉Unity粒子系统，有Shader编写经验',
        responsibilities: '制作游戏特效，优化美术资源',
        createdBy: demoUser.id,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-005' },
      update: {},
      create: {
        id: 'job-005',
        title: '游戏制作人',
        description: '负责游戏项目整体规划和推进',
        department: '管理层',
        location: '北京',
        type: 'FULL_TIME',
        status: 'PUBLISHED',
        experienceLevel: 'SENIOR',
        priority: 'HIGH',
        salaryMin: 40000,
        salaryMax: 60000,
        requirements: '5年以上游戏制作经验，有完整项目上线经验',
        responsibilities: '负责游戏项目整体规划、团队管理和进度控制',
        createdBy: demoUser.id,
      },
    }),
  ]);
  console.log(`   ✅ 创建了 ${jobs.length} 个职位`);

  // 4. 创建完整的候选人数据
  console.log('\n4️⃣  创建候选人数据...');

  const candidatesData = [
    {
      id: 'candidate-001',
      name: '张伟',
      email: 'zhangwei@example.com',
      phoneNumber: '13800138001',
      avatar: null,
      status: 'ACTIVE',
      source: 'LINKEDIN',
      location: '北京',
      currentCompany: '腾讯游戏',
      currentTitle: '高级游戏客户端开发工程师',
      expectedSalary: '35-45K',
      noticePeriod: '1个月',
      yearsOfExperience: 8,
      tags: ['Unity3D', 'C#', '游戏开发', '客户端'],
      educationLevel: 'MASTER',
      school: '清华大学',
      major: '计算机科学与技术',
      githubUrl: 'https://github.com/zhangwei',
      linkedinUrl: 'https://linkedin.com/in/zhangwei',
    },
    {
      id: 'candidate-002',
      name: '李娜',
      email: 'lina@example.com',
      phoneNumber: '13800138002',
      avatar: null,
      status: 'ACTIVE',
      source: 'REFERRAL',
      location: '上海',
      currentCompany: '米哈游',
      currentTitle: '游戏UI设计师',
      expectedSalary: '25-35K',
      noticePeriod: '2周',
      yearsOfExperience: 5,
      tags: ['UI设计', 'Photoshop', 'Figma', '游戏美术'],
      educationLevel: 'BACHELOR',
      school: '中国美术学院',
      major: '视觉传达设计',
      portfolioUrl: 'https://lina.design',
    },
    {
      id: 'candidate-003',
      name: '王强',
      email: 'wangqiang@example.com',
      phoneNumber: '13800138003',
      avatar: null,
      status: 'HIRED',
      source: 'DIRECT',
      location: '深圳',
      currentCompany: '网易游戏',
      currentTitle: '游戏服务器开发工程师',
      expectedSalary: '40-50K',
      noticePeriod: '1个月',
      yearsOfExperience: 10,
      tags: ['C++', '服务器开发', '分布式系统', '网络编程'],
      educationLevel: 'MASTER',
      school: '浙江大学',
      major: '软件工程',
    },
    {
      id: 'candidate-004',
      name: '刘颖',
      email: 'liuying@example.com',
      phoneNumber: '13800138004',
      avatar: null,
      status: 'ACTIVE',
      source: 'UPLOAD',
      location: '北京',
      currentCompany: '字节跳动',
      currentTitle: '游戏技术美术',
      expectedSalary: '20-30K',
      noticePeriod: '2周',
      yearsOfExperience: 3,
      tags: ['Unity', 'Shader', 'VFX', '技术美术'],
      educationLevel: 'BACHELOR',
      school: '北京电影学院',
      major: '数字媒体艺术',
    },
    {
      id: 'candidate-005',
      name: '陈浩',
      email: 'chenhao@example.com',
      phoneNumber: '13800138005',
      avatar: null,
      status: 'INTERVIEWING',
      source: 'LIEPIN',
      location: '杭州',
      currentCompany: '完美世界',
      currentTitle: '资深游戏策划',
      expectedSalary: '30-40K',
      noticePeriod: '1个月',
      yearsOfExperience: 6,
      tags: ['游戏策划', '系统设计', '数值策划', 'Unity'],
      educationLevel: 'MASTER',
      school: '上海交通大学',
      major: '工业设计',
    },
    {
      id: 'candidate-006',
      name: '赵敏',
      email: 'zhaomin@example.com',
      phoneNumber: '13800138006',
      avatar: null,
      status: 'ACTIVE',
      source: 'BOSS',
      location: '成都',
      currentCompany: '腾讯游戏',
      currentTitle: '游戏客户端开发工程师',
      expectedSalary: '25-35K',
      noticePeriod: '3周',
      yearsOfExperience: 4,
      tags: ['Unity3D', 'C#', 'iOS', 'Android'],
      educationLevel: 'BACHELOR',
      school: '电子科技大学',
      major: '软件工程',
    },
    {
      id: 'candidate-007',
      name: '孙丽',
      email: 'sunli@example.com',
      phoneNumber: '13800138007',
      avatar: null,
      status: 'ACTIVE',
      source: 'LAGOU',
      location: '广州',
      currentCompany: '三七互娱',
      currentTitle: '游戏运营专员',
      expectedSalary: '15-20K',
      noticePeriod: '2周',
      yearsOfExperience: 2,
      tags: ['游戏运营', '数据分析', '用户运营'],
      educationLevel: 'BACHELOR',
      school: '中山大学',
      major: '市场营销',
    },
    {
      id: 'candidate-008',
      name: '周杰',
      email: 'zhoujie@example.com',
      phoneNumber: '13800138008',
      avatar: null,
      status: 'SHORTLISTED',
      source: 'REFERRAL',
      location: '北京',
      currentCompany: '莉莉丝游戏',
      currentTitle: '游戏制作人',
      expectedSalary: '50-70K',
      noticePeriod: '2个月',
      yearsOfExperience: 12,
      tags: ['游戏制作', '项目管理', '产品设计'],
      educationLevel: 'MASTER',
      school: '北京大学',
      major: '工商管理',
    },
    {
      id: 'candidate-009',
      name: '吴磊',
      email: 'wulei@example.com',
      phoneNumber: '13800138009',
      avatar: null,
      status: 'ACTIVE',
      source: 'LINKEDIN',
      location: '上海',
      currentCompany: '叠纸游戏',
      currentTitle: '游戏UI设计师',
      expectedSalary: '18-25K',
      noticePeriod: '1周',
      yearsOfExperience: 2,
      tags: ['UI设计', '插画', 'Figma', 'Sketch'],
      educationLevel: 'BACHELOR',
      school: '同济大学',
      major: '设计学',
    },
    {
      id: 'candidate-010',
      name: '郑华',
      email: 'zhenghua@example.com',
      phoneNumber: '13800138010',
      avatar: null,
      status: 'ACTIVE',
      source: 'DIRECT',
      location: '深圳',
      currentCompany: '英雄互娱',
      currentTitle: '游戏服务器架构师',
      expectedSalary: '45-60K',
      noticePeriod: '1个月',
      yearsOfExperience: 15,
      tags: ['C++', 'Go', '微服务', '分布式架构', '高并发'],
      educationLevel: 'PHD',
      school: '清华大学',
      major: '计算机科学与技术',
    },
  ];

  const candidates = await Promise.all(
    candidatesData.map((data) =>
      prisma.candidate.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      })
    )
  );
  console.log(`   ✅ 创建了 ${candidates.length} 个候选人`);

  // 5. 创建应聘记录
  console.log('\n5️⃣  创建应聘记录...');

  const applicationsData = [
    { candidateId: 'candidate-001', jobId: 'job-001', status: 'INTERVIEWING' },
    { candidateId: 'candidate-001', jobId: 'job-002', status: 'SHORTLISTED' },
    { candidateId: 'candidate-002', jobId: 'job-003', status: 'APPLIED' },
    { candidateId: 'candidate-003', jobId: 'job-002', status: 'HIRED' },
    { candidateId: 'candidate-004', jobId: 'job-004', status: 'INTERVIEWING' },
    { candidateId: 'candidate-005', jobId: 'job-005', status: 'SHORTLISTED' },
    { candidateId: 'candidate-006', jobId: 'job-001', status: 'APPLIED' },
    { candidateId: 'candidate-007', jobId: 'job-003', status: 'SHORTLISTED' },
    { candidateId: 'candidate-008', jobId: 'job-005', status: 'INTERVIEWING' },
    { candidateId: 'candidate-009', jobId: 'job-003', status: 'APPLIED' },
    { candidateId: 'candidate-010', jobId: 'job-002', status: 'SHORTLISTED' },
    { candidateId: 'candidate-002', jobId: 'job-004', status: 'APPLIED' },
    { candidateId: 'candidate-006', jobId: 'job-002', status: 'SHORTLISTED' },
    { candidateId: 'candidate-004', jobId: 'job-001', status: 'APPLIED' },
    { candidateId: 'candidate-005', jobId: 'job-001', status: 'SHORTLISTED' },
  ];

  const applications = await Promise.all(
    applicationsData.map((data, index) =>
      prisma.application.upsert({
        where: { id: `app-${index + 1}` },
        update: {},
        create: {
          id: `app-${index + 1}`,
          candidateId: data.candidateId,
          jobId: data.jobId,
          status: data.status,
          source: 'DIRECT',
          transparencyLevel: 'STANDARD',
          appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      })
    )
  );
  console.log(`   ✅ 创建了 ${applications.length} 个应聘记录`);

  // 6. 创建面试记录
  console.log('\n6️⃣  创建面试记录...');

  const interviewsData = [
    {
      applicationId: 'app-1',
      interviewerId: demoUser.id,
      title: '技术面试 - Unity3D开发',
      type: 'VIDEO',
      stage: 'TECHNICAL',
      status: 'COMPLETED',
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      score: 8,
      notes: '技术扎实，项目经验丰富',
      feedback: {
        pros: ['Unity3D经验丰富', '项目架构能力强', '沟通表达清晰'],
        cons: ['对某些优化细节不够熟悉'],
        tags: ['技术强', '推荐录用'],
      },
    },
    {
      applicationId: 'app-4',
      interviewerId: demoUser.id,
      title: '技术美术面试',
      type: 'ONSITE',
      stage: 'TECHNICAL',
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      notes: '准备查看作品集',
    },
    {
      applicationId: 'app-9',
      interviewerId: demoUser.id,
      title: '制作人面试',
      type: 'VIDEO',
      stage: 'HR',
      status: 'COMPLETED',
      scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      score: 9,
      notes: '综合能力强，有成功项目经验',
      feedback: {
        pros: ['项目经验丰富', '管理能力强', '行业认知深'],
        cons: ['期望薪资较高'],
        tags: ['推荐录用', '高级人才'],
      },
    },
    {
      applicationId: 'app-3',
      interviewerId: demoUser.id,
      title: 'UI设计作品展示',
      type: 'VIDEO',
      stage: 'PORTFOLIO',
      status: 'COMPLETED',
      scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      score: 7,
      notes: '设计能力不错，但需要提升交互理解',
      feedback: {
        pros: ['色彩搭配好', '设计风格多样'],
        cons: ['交互设计经验较少'],
        tags: ['设计能力强', '可考虑'],
      },
    },
    {
      applicationId: 'app-5',
      interviewerId: demoUser.id,
      title: '初试 - 游戏策划',
      type: 'VIDEO',
      stage: 'INITIAL_SCREENING',
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 30,
      notes: '准备了解其项目经验',
    },
  ];

  const interviews = await Promise.all(
    interviewsData.map((data, index) =>
      prisma.interview.upsert({
        where: { id: `interview-${index + 1}` },
        update: {},
        create: {
          id: `interview-${index + 1}`,
          ...data,
          description: `面试评估：${data.title}`,
        },
      })
    )
  );
  console.log(`   ✅ 创建了 ${interviews.length} 个面试记录`);

  // 7. 为候选人添加教育经历
  console.log('\n7️⃣  添加教育经历...');
  const educations = [
    { candidateId: 'candidate-001', school: '清华大学', major: '计算机科学与技术', degree: 'MASTER', graduationYear: 2016 },
    { candidateId: 'candidate-002', school: '中国美术学院', major: '视觉传达设计', degree: 'BACHELOR', graduationYear: 2019 },
    { candidateId: 'candidate-003', school: '浙江大学', major: '软件工程', degree: 'MASTER', graduationYear: 2014 },
    { candidateId: 'candidate-005', school: '上海交通大学', major: '工业设计', degree: 'MASTER', graduationYear: 2018 },
    { candidateId: 'candidate-008', school: '北京大学', major: '工商管理', degree: 'MASTER', graduationYear: 2012 },
    { candidateId: 'candidate-010', school: '清华大学', major: '计算机科学与技术', degree: 'PHD', graduationYear: 2010 },
  ];

  await Promise.all(
    educations.map((data) =>
      prisma.education.create({
        data: {
          ...data,
          startDate: new Date(`${data.graduationYear - 3}-09-01`).toISOString(),
          endDate: new Date(`${data.graduationYear}-06-30`).toISOString(),
        },
      })
    )
  );
  console.log(`   ✅ 创建了 ${educations.length} 条教育经历`);

  // 8. 为候选人添加工作经历
  console.log('\n8️⃣  添加工作经历...');
  const workExperiences = [
    {
      candidateId: 'candidate-001',
      company: '腾讯游戏',
      position: '高级游戏客户端开发工程师',
      startDate: '2020-06-01',
      endDate: null,
      description: '负责王者荣耀客户端开发和性能优化',
    },
    {
      candidateId: 'candidate-002',
      company: '米哈游',
      position: '游戏UI设计师',
      startDate: '2021-03-01',
      endDate: null,
      description: '负责原神UI设计和交互优化',
    },
    {
      candidateId: 'candidate-003',
      company: '网易游戏',
      position: '游戏服务器架构师',
      startDate: '2018-08-01',
      endDate: null,
      description: '负责多个MMO游戏服务器架构设计',
    },
  ];

  await Promise.all(
    workExperiences.map((data) =>
      prisma.workExperience.create({
        data: {
          ...data,
          current: data.endDate === null,
        },
      })
    )
  );
  console.log(`   ✅ 创建了 ${workExperiences.length} 条工作经历`);

  console.log('\n✨ 数据库初始化完成！\n');
  console.log('📊 数据统计：');
  console.log(`   用户: 1 (demo@test.com / demo123)`);
  console.log(`   职位: ${jobs.length} 个`);
  console.log(`   候选人: ${candidates.length} 个`);
  console.log(`   应聘记录: ${applications.length} 个`);
  console.log(`   面试记录: ${interviews.length} 个`);
  console.log(`   教育经历: ${educations.length} 条`);
  console.log(`   工作经历: ${workExperiences.length} 条`);
  console.log('\n🎉 所有测试数据已创建完成！\n');
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
