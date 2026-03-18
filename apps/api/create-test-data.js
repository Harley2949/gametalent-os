const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建测试数据...\n');

  // 1. 创建测试用户
  console.log('1. 创建测试用户...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gametalent.os' },
    update: {},
    create: {
      email: 'admin@gametalent.os',
      name: '系统管理员',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      department: '技术部',
      title: '技术总监',
    },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@gametalent.os' },
    update: {},
    create: {
      email: 'recruiter@gametalent.os',
      name: '张招聘',
      password: hashedPassword,
      role: 'RECRUITER',
      status: 'ACTIVE',
      department: '人力资源部',
      title: '招聘经理',
    },
  });

  const interviewer1 = await prisma.user.upsert({
    where: { email: 'interviewer1@gametalent.os' },
    update: {},
    create: {
      email: 'interviewer1@gametalent.os',
      name: '李技术',
      password: hashedPassword,
      role: 'INTERVIEWER',
      status: 'ACTIVE',
      department: '技术部',
      title: '高级技术面试官',
    },
  });

  const interviewer2 = await prisma.user.upsert({
    where: { email: 'interviewer2@gametalent.os' },
    update: {},
    create: {
      email: 'interviewer2@gametalent.os',
      name: '王设计',
      password: hashedPassword,
      role: 'INTERVIEWER',
      status: 'ACTIVE',
      department: '美术部',
      title: '设计总监',
    },
  });

  console.log('  ✓ 创建了4个测试用户');

  // 2. 创建公司
  console.log('\n2. 创建游戏公司...');
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { id: 'comp_tencent' },
      update: {},
      create: {
        id: 'comp_tencent',
        name: '腾讯游戏',
        aliases: ['腾讯', 'Tencent Games'],
        type: 'GAME_DEVELOPER',
        isCompetitor: true,
        scale: 'GIANT',
        country: '中国',
        city: '深圳',
        gameGenres: ['MMO', 'MOBA', 'FPS'],
        platforms: ['PC', 'Mobile', 'Console'],
      },
    }),
    prisma.company.upsert({
      where: { id: 'comp_mihoyo' },
      update: {},
      create: {
        id: 'comp_mihoyo',
        name: '米哈游',
        aliases: ['miHoYo', 'Hoyoverse'],
        type: 'GAME_DEVELOPER',
        isCompetitor: true,
        scale: 'LARGE',
        country: '中国',
        city: '上海',
        gameGenres: ['RPG', 'Gacha'],
        platforms: ['Mobile', 'PC'],
      },
    }),
    prisma.company.upsert({
      where: { id: 'comp_netease' },
      update: {},
      create: {
        id: 'comp_netease',
        name: '网易游戏',
        aliases: ['网易', 'NetEase Games'],
        type: 'GAME_DEVELOPER',
        isCompetitor: true,
        scale: 'GIANT',
        country: '中国',
        city: '广州',
        gameGenres: ['MMO', 'Card Game', 'Battle Royale'],
        platforms: ['PC', 'Mobile'],
      },
    }),
  ]);
  console.log('  ✓ 创建了3家游戏公司');

  // 3. 创建候选人
  console.log('\n3. 创建候选人...');
  const candidates = await Promise.all([
    prisma.candidate.upsert({
      where: { email: 'zhangwei@example.com' },
      update: {},
      create: {
        email: 'zhangwei@example.com',
        name: '张伟',
        phoneNumber: '13800138001',
        status: 'ACTIVE',
        source: 'LINKEDIN',
        location: '北京',
        currentCompany: '腾讯游戏',
        currentTitle: '高级客户端开发工程师',
        expectedSalary: '35-45K',
        noticePeriod: '1个月',
        yearsOfExperience: 8,
        tags: ['Unity3D', 'C++', '游戏开发', '客户端'],
        notes: '8年游戏开发经验，擅长客户端开发',
      },
    }),
    prisma.candidate.upsert({
      where: { email: 'lina@example.com' },
      update: {},
      create: {
        email: 'lina@example.com',
        name: '李娜',
        phoneNumber: '13800138002',
        status: 'ACTIVE',
        source: 'REFERRAL',
        location: '上海',
        currentCompany: '米哈游',
        currentTitle: 'UI设计师',
        expectedSalary: '25-35K',
        noticePeriod: '2周',
        yearsOfExperience: 5,
        tags: ['UI设计', 'Photoshop', 'Figma', '游戏美术'],
        notes: '5年UI设计经验，有多个成功项目',
      },
    }),
    prisma.candidate.upsert({
      where: { email: 'wangqiang@example.com' },
      update: {},
      create: {
        email: 'wangqiang@example.com',
        name: '王强',
        phoneNumber: '13800138003',
        status: 'ACTIVE',
        source: 'CAREER_PAGE',
        location: '深圳',
        currentCompany: '网易游戏',
        currentTitle: '服务器开发工程师',
        expectedSalary: '40-50K',
        noticePeriod: '1个月',
        yearsOfExperience: 10,
        tags: ['C++', '服务器开发', '分布式系统', '网络编程'],
        notes: '10年服务器开发经验，技术扎实',
      },
    }),
    prisma.candidate.upsert({
      where: { email: 'zhaoli@example.com' },
      update: {},
      create: {
        email: 'zhaoli@example.com',
        name: '赵丽',
        phoneNumber: '13800138004',
        status: 'ACTIVE',
        source: 'LINKEDIN',
        location: '北京',
        currentCompany: '腾讯游戏',
        currentTitle: '游戏策划',
        expectedSalary: '30-40K',
        noticePeriod: '2周',
        yearsOfExperience: 6,
        tags: ['游戏策划', '系统设计', '数值策划', 'Unity3D'],
        notes: '6年游戏策划经验，擅长系统设计',
      },
    }),
    prisma.candidate.upsert({
      where: { email: 'liuming@example.com' },
      update: {},
      create: {
        email: 'liuming@example.com',
        name: '刘明',
        phoneNumber: '13800138005',
        status: 'ACTIVE',
        source: 'AGENCY',
        location: '上海',
        currentCompany: '米哈游',
        currentTitle: '技术美术',
        expectedSalary: '35-45K',
        noticePeriod: '1个月',
        yearsOfExperience: 7,
        tags: ['技术美术', 'Shader', 'Python', '美术工具'],
        notes: '7年技术美术经验，擅长Shader开发',
      },
    }),
  ]);
  console.log('  ✓ 创建了5个候选人');

  // 4. 创建职位
  console.log('\n4. 创建职位...');
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: '高级游戏客户端开发工程师',
        description: '负责游戏客户端核心功能开发和性能优化',
        requirements: '5年以上游戏开发经验，精通C++/Unity，有完整项目经验',
        responsibilities: '负责游戏客户端开发和维护，参与架构设计',
        status: 'PUBLISHED',
        type: 'FULL_TIME',
        workMode: 'ONSITE',
        experienceLevel: 'SENIOR',
        priority: 'HIGH',
        salaryMin: 25000,
        salaryMax: 40000,
        salaryCurrency: 'CNY',
        location: '北京',
        remoteRegions: [],
        department: '技术部',
        team: '客户端开发组',
        targetCompanies: ['腾讯游戏', '网易游戏', '米哈游'],
        targetSkills: ['C++', 'Unity3D', '游戏开发', '性能优化'],
        createdBy: admin.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '游戏UI设计师',
        description: '负责游戏UI界面设计和交互设计',
        requirements: '3年以上UI设计经验，精通Figma/Photoshop，有游戏项目经验',
        responsibilities: '负责游戏UI/UX设计，输出设计规范',
        status: 'PUBLISHED',
        type: 'FULL_TIME',
        workMode: 'HYBRID',
        experienceLevel: 'MID',
        priority: 'MEDIUM',
        salaryMin: 20000,
        salaryMax: 30000,
        salaryCurrency: 'CNY',
        location: '上海',
        remoteRegions: ['上海', '杭州'],
        department: '美术部',
        team: 'UI设计组',
        targetCompanies: ['米哈游', '莉莉丝', '叠纸'],
        targetSkills: ['UI设计', 'Figma', 'Photoshop', '游戏UI'],
        createdBy: recruiter.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '游戏服务器开发工程师',
        description: '负责游戏服务器端开发和架构设计',
        requirements: '5年以上服务器开发经验，精通C++/Go，熟悉分布式系统',
        responsibilities: '负责游戏服务器开发，性能优化，架构设计',
        status: 'PUBLISHED',
        type: 'FULL_TIME',
        workMode: 'ONSITE',
        experienceLevel: 'SENIOR',
        priority: 'HIGH',
        salaryMin: 30000,
        salaryMax: 50000,
        salaryCurrency: 'CNY',
        location: '深圳',
        remoteRegions: [],
        department: '技术部',
        team: '服务器开发组',
        targetCompanies: ['腾讯游戏', '网易游戏'],
        targetSkills: ['C++', 'Go', '服务器开发', '分布式'],
        createdBy: admin.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '游戏系统策划',
        description: '负责游戏系统设计和数值平衡',
        requirements: '3年以上游戏策划经验，有成功项目经验',
        responsibilities: '负责游戏系统设计，数值平衡，玩法优化',
        status: 'DRAFT',
        type: 'FULL_TIME',
        workMode: 'HYBRID',
        experienceLevel: 'MID',
        priority: 'MEDIUM',
        salaryMin: 20000,
        salaryMax: 35000,
        salaryCurrency: 'CNY',
        location: '北京',
        remoteRegions: ['北京', '上海'],
        department: '策划部',
        team: '系统策划组',
        targetCompanies: ['腾讯游戏', '米哈游', '网易游戏'],
        targetSkills: ['游戏策划', '系统设计', '数值策划'],
        createdBy: recruiter.id,
      },
    }),
  ]);
  console.log('  ✓ 创建了4个职位');

  // 5. 创建应聘记录
  console.log('\n5. 创建应聘记录...');
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        candidateId: candidates[0].id,
        jobId: jobs[0].id,
        status: 'INTERVIEWING',
        source: 'LINKEDIN',
        appliedAt: new Date('2026-03-01'),
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidates[1].id,
        jobId: jobs[1].id,
        status: 'SCREENING',
        source: 'REFERRAL',
        appliedAt: new Date('2026-03-05'),
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidates[2].id,
        jobId: jobs[2].id,
        status: 'SHORTLISTED',
        source: 'CAREER_PAGE',
        appliedAt: new Date('2026-03-03'),
      },
    }),
  ]);
  console.log('  ✓ 创建了3个应聘记录');

  // 6. 创建面试
  console.log('\n6. 创建面试...');
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const interviews = await Promise.all([
    prisma.interview.create({
      data: {
        applicationId: applications[0].id,
        interviewerId: interviewer1.id,
        title: '技术面试 - 张伟',
        description: '初试技术能力评估',
        status: 'SCHEDULED',
        type: 'VIDEO',
        stage: 'FIRST_ROUND',
        scheduledAt: tomorrow,
        duration: 60,
        location: '腾讯会议',
      },
    }),
    prisma.interview.create({
      data: {
        applicationId: applications[0].id,
        interviewerId: interviewer2.id,
        title: '文化面试 - 张伟',
        description: '文化匹配度评估',
        status: 'SCHEDULED',
        type: 'VIDEO',
        stage: 'SECOND_ROUND',
        scheduledAt: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
        duration: 45,
        location: '腾讯会议',
      },
    }),
    prisma.interview.create({
      data: {
        applicationId: applications[2].id,
        interviewerId: interviewer1.id,
        title: '技术面试 - 王强',
        description: '高级技术面试',
        status: 'COMPLETED',
        type: 'VIDEO',
        stage: 'FIRST_ROUND',
        scheduledAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        duration: 90,
        location: 'Zoom',
        score: 4,
        notes: '技术能力强，服务器经验丰富，推荐复试',
        feedback: {
          pros: '技术基础扎实，有10年服务器开发经验',
          cons: '对云服务经验稍欠缺',
          tags: ['技术能力强', '经验丰富'],
        },
      },
    }),
  ]);
  console.log('  ✓ 创建了3个面试');

  // 7. 添加工作经历和教育经历
  console.log('\n7. 添加候选人经历...');
  await Promise.all([
    // 张伟的工作经历
    prisma.workExperience.create({
      data: {
        candidateId: candidates[0].id,
        companyId: companies[0].id,
        companyName: '腾讯游戏',
        title: '高级客户端开发工程师',
        startDate: new Date('2020-01-01'),
        endDate: null,
        isCurrent: true,
        isTargetCompany: true,
        description: '负责游戏客户端核心功能开发',
      },
    }),
    // 李娜的工作经历
    prisma.workExperience.create({
      data: {
        candidateId: candidates[1].id,
        companyId: companies[1].id,
        companyName: '米哈游',
        title: 'UI设计师',
        startDate: new Date('2021-06-01'),
        endDate: null,
        isCurrent: true,
        isTargetCompany: true,
        description: '负责原神项目UI设计',
      },
    }),
    // 教育经历
    prisma.education.create({
      data: {
        candidateId: candidates[0].id,
        school: '浙江大学',
        level: 'BACHELOR',
        major: '计算机科学与技术',
        startDate: new Date('2012-09-01'),
        endDate: new Date('2016-06-30'),
        schoolType: 'PROJECT_985',
      },
    }),
    prisma.education.create({
      data: {
        candidateId: candidates[1].id,
        school: '中国美术学院',
        level: 'BACHELOR',
        major: '视觉传达设计',
        startDate: new Date('2014-09-01'),
        endDate: new Date('2018-06-30'),
        schoolType: 'PROVINCIAL_KEY',
      },
    }),
  ]);
  console.log('  ✓ 添加了工作经历和教育经历');

  // 8. 为职位分配负责人
  console.log('\n8. 分配职位负责人...');
  await Promise.all([
    prisma.job.update({
      where: { id: jobs[0].id },
      data: {
        assignees: {
          connect: [{ id: recruiter.id }, { id: interviewer1.id }],
        },
      },
    }),
    prisma.job.update({
      where: { id: jobs[1].id },
      data: {
        assignees: {
          connect: [{ id: recruiter.id }, { id: interviewer2.id }],
        },
      },
    }),
  ]);
  console.log('  ✓ 分配了职位负责人');

  console.log('\n✅ 测试数据创建完成！\n');

  // 输出登录信息
  console.log('📝 测试账号信息：');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('管理员：admin@gametalent.os / admin123');
  console.log('招聘官：recruiter@gametalent.os / admin123');
  console.log('面试官1：interviewer1@gametalent.os / admin123');
  console.log('面试官2：interviewer2@gametalent.os / admin123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📊 数据统计：');
  console.log('  - 4个用户');
  console.log('  - 3家公司');
  console.log('  - 5个候选人');
  console.log('  - 4个职位');
  console.log('  - 3个应聘记录');
  console.log('  - 3个面试\n');
}

main()
  .catch((e) => {
    console.error('❌ 创建测试数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
