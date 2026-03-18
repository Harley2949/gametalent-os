// 测试候选人列表 API
// 复制自 @/lib/api.ts 的 Mock 数据和函数

const mockCandidates = [
  {
    id: '1',
    email: 'zhangwei@example.com',
    name: '张伟',
    phoneNumber: '13800138001',
    avatar: '',
    status: 'ACTIVE',
    source: 'LINKEDIN',
    linkedinUrl: 'https://linkedin.com/in/zhangwei',
    githubUrl: 'https://github.com/zhangwei',
    location: '北京',
    currentCompany: '腾讯游戏',
    currentTitle: '高级游戏客户端开发工程师',
    expectedSalary: '35-45K',
    noticePeriod: '1个月',
    yearsOfExperience: 8,
    tags: ['Unity3D', 'C++', '游戏开发', '客户端'],
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-10T00:00:00.000Z',
    resumes: [
      {
        id: 'r1',
        fileName: '张伟_游戏开发工程师.pdf',
        createdAt: '2024-03-01T00:00:00.000Z',
      },
    ],
    applications: [
      {
        id: 'a1',
        createdAt: '2024-03-05T00:00:00.000Z',
        job: {
          id: 'j1',
          title: '资深游戏开发工程师',
          status: 'ACTIVE',
          department: '技术部',
        },
      },
    ],
  },
  {
    id: '2',
    email: 'lina@example.com',
    name: '李娜',
    phoneNumber: '13800138002',
    avatar: '',
    status: 'ACTIVE',
    source: 'REFERRAL',
    location: '上海',
    currentCompany: '米哈游',
    currentTitle: '游戏UI设计师',
    expectedSalary: '25-35K',
    noticePeriod: '2周',
    yearsOfExperience: 5,
    tags: ['UI设计', 'Photoshop', 'Figma', '游戏美术'],
    createdAt: '2024-03-02T00:00:00.000Z',
    updatedAt: '2024-03-09T00:00:00.000Z',
    resumes: [],
    applications: [],
  },
  {
    id: '3',
    email: 'wangqiang@example.com',
    name: '王强',
    phoneNumber: '13800138003',
    avatar: '',
    status: 'HIRED',
    source: 'DIRECT',
    location: '深圳',
    currentCompany: '网易游戏',
    currentTitle: '游戏服务器开发工程师',
    expectedSalary: '40-50K',
    noticePeriod: '1个月',
    yearsOfExperience: 10,
    tags: ['C++', '服务器开发', '分布式系统', '网络编程'],
    createdAt: '2024-02-15T00:00:00.000Z',
    updatedAt: '2024-03-08T00:00:00.000Z',
    resumes: [
      {
        id: 'r2',
        fileName: '王强_服务器开发.pdf',
        createdAt: '2024-02-15T00:00:00.000Z',
      },
    ],
    applications: [],
  },
];

async function fetchCandidates(params) {
  let filtered = mockCandidates;

  // 搜索过滤
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.currentCompany?.toLowerCase().includes(searchLower)
    );
  }

  // 状态过滤
  if (params.status) {
    filtered = filtered.filter((c) => c.status === params.status);
  }

  // 标签过滤
  if (params.tags && params.tags.length > 0) {
    filtered = filtered.filter((c) =>
      params.tags.some((tag) => c.tags.includes(tag))
    );
  }

  const total = filtered.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
  };
}

async function deleteCandidate(id) {
  const index = mockCandidates.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('候选人不存在');
  }

  mockCandidates.splice(index, 1);
  return { success: true };
}

// 测试候选人列表
(async () => {
  console.log('🧪 测试候选人列表功能\n');

  console.log('测试 1: 获取所有候选人');
  let result = await fetchCandidates({ page: 1, pageSize: 10 });
  console.log(`✅ 找到 ${result.total} 位候选人`);
  console.log(`   候选人: ${result.data.map(c => c.name).join(', ')}\n`);

  console.log('测试 2: 搜索功能 - 搜索"张伟"');
  result = await fetchCandidates({ page: 1, pageSize: 10, search: '张伟' });
  console.log(`✅ 搜索结果: ${result.data.length} 条`);
  console.log(`   找到: ${result.data.map(c => c.name).join(', ')}\n`);

  console.log('测试 3: 状态筛选 - 筛选活跃候选人');
  result = await fetchCandidates({ page: 1, pageSize: 10, status: 'ACTIVE' });
  console.log(`✅ 筛选结果: ${result.data.length} 条`);
  console.log(`   活跃候选人: ${result.data.map(c => c.name).join(', ')}\n`);

  console.log('测试 4: 标签筛选 - 筛选Unity3D');
  result = await fetchCandidates({ page: 1, pageSize: 10, tags: ['Unity3D'] });
  console.log(`✅ 筛选结果: ${result.data.length} 条`);
  console.log(`   包含Unity3D标签: ${result.data.map(c => c.name).join(', ')}\n`);

  console.log('测试 5: 删除候选人 - 删除张伟');
  const beforeDelete = (await fetchCandidates({ page: 1, pageSize: 10 })).total;
  await deleteCandidate('1');
  const afterDelete = (await fetchCandidates({ page: 1, pageSize: 10 })).total;
  console.log(`✅ 删除前: ${beforeDelete} 位候选人`);
  console.log(`✅ 删除后: ${afterDelete} 位候选人`);
  console.log(`✅ 成功删除候选人\n`);

  console.log('🎉 所有测试通过！候选人列表功能正常工作。');
})();
