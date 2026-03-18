const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

// 获取认证头
export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const token = localStorage.getItem('auth_token');

  if (!token) {
    console.warn('⚠️ 未找到认证令牌，请先登录');
    return {};
  }

  return {
    'Authorization': `Bearer ${token}`,
  };
}

// Mock数据用于开发测试
const mockCandidates = [
  {
    id: '1',
    email: 'zhangwei@example.com',
    name: '张伟',
    phoneNumber: '13800138001',
    avatar: '',
    status: 'ACTIVE' as const,
    source: 'LINKEDIN' as const,
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
    status: 'ACTIVE' as const,
    source: 'REFERRAL' as const,
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
    status: 'HIRED' as const,
    source: 'DIRECT' as const,
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

export async function fetchCandidates(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  tags?: string[];
}) {
  console.log('🔍 [API] fetchCandidates 调用，参数:', params);

  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.tags) queryParams.append('tags', params.tags.join(','));
    queryParams.append('skip', String(((params.page || 1) - 1) * (params.pageSize || 100))); // 增加默认pageSize到100
    queryParams.append('take', String(params.pageSize || 100));

    const response = await fetch(`${API_BASE_URL}/api/candidates?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    console.log(`📥 [API] 候选人API响应: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.warn(`⚠️ 获取候选人API失败 (${response.status}): ${errorText}`);
      throw new Error(`API返回 ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ [API] 获取到 ${data.data?.length || 0} 个候选人`);

    return {
      data: data.data || data,
      total: data.total || data.length,
      page: params.page || 1,
      pageSize: params.pageSize || 100,
    };
  } catch (error) {
    console.error('❌ [API] 获取候选人失败，使用Mock数据:', error);
    await new Promise((resolve) => setTimeout(resolve, 100)); // 模拟网络延迟

    let filtered = [...mockCandidates];

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
        params.tags!.some((tag) => c.tags.includes(tag))
      );
    }

    const paginated = filtered.slice(
      ((params.page || 1) - 1) * (params.pageSize || 10),
      ((params.page || 1) - 1) * (params.pageSize || 10) + (params.pageSize || 10)
    );

    console.log(`📝 [Mock] 返回 ${paginated.length} 个候选人（Mock模式）`);

    return {
      data: paginated,
      total: filtered.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
  }
}

export async function fetchCandidate(id: string) {
  console.log('🔄 [API] 获取候选人详情:', id);

  try {
    const response = await fetch(`${API_BASE_URL}/api/candidates/${id}`, {
      headers: getAuthHeaders(),
    });

    console.log('📡 [API] 响应状态:', response.status);

    if (!response.ok) {
      throw new Error('获取候选人详情失败');
    }

    const data = await response.json();
    console.log('✅ [API] 候选人数据加载成功:', data.data?.name || data.name);
    return data.data || data;
  } catch (error) {
    // API失败时回退到mock数据
    console.warn('⚠️ 获取候选人详情API失败，使用Mock数据:', error);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const candidate = mockCandidates.find((c) => c.id === id);
    if (!candidate) {
      throw new Error('候选人不存在');
    }

    console.log('📊 [Mock] 返回候选人Mock数据:', candidate.name);
    return candidate;
  }
}

export async function createCandidate(data: any) {
  try {
    console.log('🔗 [创建候选人] 正在调用后端API:', data);
    const response = await fetch(`${API_BASE_URL}/api/candidates`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '创建候选人失败' }));
      throw new Error(error.message || '创建候选人失败');
    }

    const result = await response.json();
    console.log('✅ [创建候选人] API返回成功:', result);
    return result.data || result;
  } catch (error) {
    // API失败时回退到mock数据
    console.warn('⚠️ 创建候选人API失败，使用Mock数据:', error);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newCandidate = {
      ...data,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resumes: [],
      applications: [],
    };

    mockCandidates.push(newCandidate);
    console.log('✅ [创建候选人] Mock数据已保存:', newCandidate);
    return newCandidate;
  }
}

export async function updateCandidate(id: string, data: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/candidates/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('更新候选人失败');
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('❌ [前端] 更新候选人异常:', error);

    // 不再回退到 mock 数据，直接抛出错误让上层处理
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('更新失败，请重试');
  }
}

export async function deleteCandidate(id: string) {
  try {
    console.log('🗑️ [删除候选人] 正在调用后端API，ID:', id);
    const response = await fetch(`${API_BASE_URL}/api/candidates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '删除候选人失败' }));
      throw new Error(error.message || '删除候选人失败');
    }

    const result = await response.json();
    console.log('✅ [删除候选人] API返回成功:', result);
    return result.data || result;
  } catch (error) {
    // API失败时回退到mock数据
    console.warn('⚠️ 删除候选人API失败，使用Mock数据:', error);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = mockCandidates.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('候选人不存在');
    }

    mockCandidates.splice(index, 1);
    return { success: true };
  }
}

export async function fetchCandidateStats() {
  // 使用mock数据，待后续集成真实API
  await new Promise((resolve) => setTimeout(resolve, 300)); // 模拟网络延迟

  const total = mockCandidates.length;
  const active = mockCandidates.filter((c) => c.status === 'ACTIVE').length;

  // 计算本周新增
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newThisWeek = mockCandidates.filter((c) => {
    const createdAt = new Date(c.createdAt);
    return createdAt >= oneWeekAgo;
  }).length;

  return {
    total,
    active,
    newThisWeek,
    inactive: total - active,
  };
}

// ============ User APIs ============

/**
 * 获取所有用户（面试官列表）
 */
export async function fetchUsers(params?: { skip?: number; take?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.take !== undefined) queryParams.append('take', params.take.toString());

  const response = await fetch(`${API_BASE_URL}/api/users?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取用户列表失败');
  }

  return response.json();
}

/**
 * 根据 ID 获取用户信息
 */
export async function fetchUser(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取用户信息失败');
  }

  return response.json();
}

// ============ Job APIs ============

// Mock职位数据
const mockJobs = [
  {
    id: 'j1',
    title: '资深游戏开发工程师',
    description: '负责游戏客户端开发和优化',
    requirements: '5年以上游戏开发经验',
    responsibilities: '负责核心功能开发',
    status: 'PUBLISHED' as const,
    type: 'FULL_TIME' as const,
    workMode: 'HYBRID' as const,
    experienceLevel: 'SENIOR' as const,
    priority: 'HIGH' as const,
    salaryMin: 25000,
    salaryMax: 35000,
    salaryCurrency: 'CNY',
    location: '北京',
    remoteRegions: [],
    department: '技术部',
    team: '客户端开发组',
    targetCompanies: [],
    targetSkills: ['Unity3D', 'C#', 'C++'],
    applicantCount: 5,
    interviewCount: 2,
    offerCount: 0,
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-10T00:00:00.000Z',
    creator: { id: 'u1', name: '管理员', email: 'admin@gametalent.os' },
    assignees: [],
    _count: { applications: 5 },
  },
  {
    id: 'j2',
    title: '游戏UI设计师',
    description: '负责游戏界面设计和交互',
    requirements: '3年以上UI设计经验',
    responsibilities: '负责游戏UI/UX设计',
    status: 'PUBLISHED' as const,
    type: 'FULL_TIME' as const,
    workMode: 'ONSITE' as const,
    experienceLevel: 'MID' as const,
    priority: 'MEDIUM' as const,
    salaryMin: 15000,
    salaryMax: 20000,
    salaryCurrency: 'CNY',
    location: '上海',
    remoteRegions: [],
    department: '美术部',
    team: 'UI设计组',
    targetCompanies: [],
    targetSkills: ['Figma', 'Photoshop', 'Unity'],
    applicantCount: 3,
    interviewCount: 1,
    offerCount: 0,
    createdAt: '2024-03-05T00:00:00.000Z',
    updatedAt: '2024-03-10T00:00:00.000Z',
    creator: { id: 'u1', name: '管理员', email: 'admin@gametalent.os' },
    assignees: [],
    _count: { applications: 3 },
  },
  {
    id: 'j3',
    title: '游戏服务器开发工程师',
    description: '负责游戏服务器端开发',
    requirements: '3年后端开发经验',
    responsibilities: '负责游戏服务器架构和开发',
    status: 'DRAFT' as const,
    type: 'FULL_TIME' as const,
    workMode: 'REMOTE' as const,
    experienceLevel: 'MID' as const,
    priority: 'LOW' as const,
    salaryMin: 20000,
    salaryMax: 30000,
    salaryCurrency: 'CNY',
    location: '远程',
    remoteRegions: ['全国'],
    department: '技术部',
    team: '服务端开发组',
    targetCompanies: [],
    targetSkills: ['Node.js', 'Go', 'Redis'],
    applicantCount: 0,
    interviewCount: 0,
    offerCount: 0,
    createdAt: '2024-03-08T00:00:00.000Z',
    updatedAt: '2024-03-10T00:00:00.000Z',
    creator: { id: 'u1', name: '管理员', email: 'admin@gametalent.os' },
    assignees: [],
    _count: { applications: 0 },
  },
];

/**
 * 获取职位列表（对接真实后端API）
 */
export async function fetchJobs(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  department?: string;
  experienceLevel?: string;
  priority?: string;
}) {
  // Mock模式：返回mock数据
  if (useMockData) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      data: mockJobs,
      total: mockJobs.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
  }

  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.department) queryParams.append('department', params.department);
    if (params.experienceLevel) queryParams.append('experienceLevel', params.experienceLevel);
    if (params.priority) queryParams.append('priority', params.priority);
    queryParams.append('skip', String(((params.page || 1) - 1) * (params.pageSize || 10)));
    queryParams.append('take', String(params.pageSize || 10));

    const response = await fetch(`${API_BASE_URL}/api/jobs?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    // API调用失败时，切换到mock数据
    if (!response.ok) {
      console.warn('⚠️ API调用失败，切换到Mock数据模式');
      useMockData = true;
      return {
        data: mockJobs,
        total: mockJobs.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
      };
    }

    const data = await response.json();
    return {
      data: data.data || data,
      total: data.total || data.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
  } catch (error) {
    // 网络错误或其他异常，切换到mock数据
    console.warn('⚠️ 网络错误或API不可用，切换到Mock数据模式:', error);
    useMockData = true;
    return {
      data: mockJobs,
      total: mockJobs.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
  }
}

/**
 * 获取职位统计数据
 */
export async function fetchJobStats() {
  if (useMockData) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    // 从 mockJobs 计算统计数据
    const total = mockJobs.length;
    const published = mockJobs.filter((j) => j.status === 'PUBLISHED').length;
    const draft = mockJobs.filter((j) => j.status === 'DRAFT').length;
    const today = new Date().toISOString().split('T')[0];
    const todayNew = mockJobs.filter((j) => j.createdAt.startsWith(today)).length;

    return {
      total,
      published,
      draft,
      todayNew,
      closed: 0,
      archived: 0,
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/stats/summary`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.warn('⚠️ API调用失败，返回默认统计数据');
      return {
        total: 0,
        published: 0,
        draft: 0,
        todayNew: 0,
        closed: 0,
        archived: 0,
      };
    }

    return response.json();
  } catch (error) {
    console.warn('⚠️ 网络错误，返回默认统计数据:', error);
    return {
      total: 0,
      published: 0,
      draft: 0,
      todayNew: 0,
      closed: 0,
      archived: 0,
    };
  }
}

/**
 * 获取职位详情
 */
export async function fetchJob(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取职位详情失败');
  }

  return response.json();
}

/**
 * 创建职位
 */
export async function createJob(data: any) {
  const response = await fetch(`${API_BASE_URL}/api/jobs`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('创建职位失败');
  }

  return response.json();
}

/**
 * 更新职位
 */
export async function updateJob(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('更新职位失败');
  }

  return response.json();
}

/**
 * 删除职位
 */
export async function deleteJob(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('删除职位失败');
  }

  return { success: true };
}

/**
 * 发布职位
 */
export async function publishJob(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${id}/publish`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('发布职位失败');
  }

  return response.json();
}

/**
 * 关闭职位
 */
export async function closeJob(id: string, reason?: string) {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${id}/close`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reason ? { reason } : {}),
  });

  if (!response.ok) {
    throw new Error('关闭职位失败');
  }

  return response.json();
}

/**
 * 归档职位
 */
export async function archiveJob(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${id}/archive`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('归档职位失败');
  }

  return response.json();
}

/**
 * 复制职位
 */
export async function duplicateJob(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${id}/duplicate`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('复制职位失败');
  }

  return response.json();
}

// ============ Interview APIs ============

// Mock用户数据
const mockUsers = [
  {
    id: 'user1',
    name: 'Admin User',
    email: 'admin@gametalent.os',
    role: 'ADMIN',
  },
  {
    id: 'user2',
    name: 'HR 专员',
    email: 'hr@gametalent.os',
    role: 'RECRUITER',
  },
];

// Mock应聘记录数据
const mockApplications = [
  {
    id: 'app1',
    candidateId: '1',
    jobId: 'j1',
    status: 'INTERVIEWING',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'app2',
    candidateId: '2',
    jobId: 'j1',
    status: 'SHORTLISTED',
    createdAt: '2026-03-05T00:00:00.000Z',
  },
];

// Mock面试数据
const mockInterviews = [
  {
    id: 'int1',
    title: '技术面试 - 第一轮',
    description: '考察候选人Unity3D和C#开发能力',
    type: 'VIDEO',
    stage: 'TECHNICAL',
    status: 'COMPLETED',
    scheduledAt: '2026-03-10T14:00:00.000Z',
    duration: 60,
    notes: '候选人技术能力扎实，熟悉Unity3D开发流程',
    createdAt: '2026-03-08T00:00:00.000Z',
    updatedAt: '2026-03-10T00:00:00.000Z',
    application: {
      id: 'app1',
      candidate: {
        id: '1',
        name: '张伟',
        email: 'zhangwei@example.com',
        phoneNumber: '13800138001',
      },
      job: {
        id: 'j1',
        title: '资深游戏开发工程师',
      },
    },
  },
  {
    id: 'int2',
    title: 'HR面试',
    description: '综合评估候选人 cultural fit 和职业规划',
    type: 'ONSITE',
    stage: 'CULTURAL',
    status: 'SCHEDULED',
    scheduledAt: '2026-03-15T10:00:00.000Z',
    duration: 45,
    notes: '',
    createdAt: '2026-03-10T00:00:00.000Z',
    updatedAt: '2026-03-10T00:00:00.000Z',
    application: {
      id: 'app3',
      candidate: {
        id: '3',
        name: '王强',
        email: 'wangqiang@example.com',
        phoneNumber: '13800138003',
      },
      job: {
        id: 'j2',
        title: '游戏服务器开发工程师',
      },
    },
  },
  {
    id: 'int3',
    title: '技术面试 - 第二轮',
    description: '深入考察系统设计和架构能力',
    type: 'VIDEO',
    stage: 'TECHNICAL',
    status: 'CANCELLED',
    scheduledAt: '2026-03-12T15:00:00.000Z',
    duration: 90,
    notes: '候选人因时间冲突取消面试，已重新安排',
    createdAt: '2026-03-09T00:00:00.000Z',
    updatedAt: '2026-03-11T00:00:00.000Z',
    application: {
      id: 'app2',
      candidate: {
        id: '2',
        name: '李娜',
        email: 'lina@example.com',
        phoneNumber: '13800138002',
      },
      job: {
        id: 'j2',
        title: '游戏UI设计师',
      },
    },
  },
];

const mockInterviewStats = {
  total: 3,
  scheduled: 1,
  completed: 1,
  cancelled: 1,
  noShow: 0,
  todayCount: 0,
};

// 是否使用Mock数据（面试模块独立控制）
// 设置为false使用真实API数据
let useMockInterviewData = false; // 使用真实后端API

/**
 * 获取面试列表
 */
export async function fetchInterviews(params: {
  page?: number;
  pageSize?: number;
  applicationId?: string;
  interviewerId?: string;
  status?: string;
  stage?: string;
}) {
  console.log('🔍 [API DEBUG] fetchInterviews被调用, useMockInterviewData=', useMockInterviewData);
  console.log('🔍 [API DEBUG] mockInterviews长度:', mockInterviews.length);

  // 如果已经标记为使用mock数据，直接返回
  if (useMockInterviewData) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    let filtered = mockInterviews;
    if (params.status) {
      filtered = filtered.filter((i) => i.status === params.status);
    }
    if (params.stage) {
      filtered = filtered.filter((i) => i.stage === params.stage);
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;

    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  try {
    const skip = ((params.page || 1) - 1) * (params.pageSize || 10);
    const take = params.pageSize || 10;

    const queryParams = new URLSearchParams();
    if (params.applicationId) queryParams.append('applicationId', params.applicationId);
    if (params.interviewerId) queryParams.append('interviewerId', params.interviewerId);
    if (params.status) queryParams.append('status', params.status);
    if (params.stage) queryParams.append('stage', params.stage);

    const queryString = `skip=${skip}&take=${take}${queryParams.toString() ? '&' + queryParams.toString() : ''}`;

    console.log('🌐 [API] 调用面试列表接口:', `${API_BASE_URL}/api/interviews?${queryString}`);

    const response = await fetch(`${API_BASE_URL}/api/interviews?${queryString}`, {
      headers: getAuthHeaders(),
    });

    console.log('📡 [API] 响应状态:', response.status, response.statusText);

    // API调用失败时，切换到mock数据
    if (!response.ok) {
      console.warn('⚠️ API调用失败，切换到Mock数据模式');
      useMockInterviewData = true;
      let filtered = mockInterviews;
      if (params.status) filtered = filtered.filter((i) => i.status === params.status);
      if (params.stage) filtered = filtered.filter((i) => i.stage === params.stage);

      console.log('📊 [Mock] 返回Mock数据:', filtered.length, '条记录');

      return {
        data: filtered.slice(0, params.pageSize || 10),
        total: filtered.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
      };
    }

    const data = await response.json();
    console.log('✅ [API] 真实数据加载成功:', {
      total: data.total || data.length,
      firstItem: data.data?.[0] || data[0]
    });

    return {
      data: data.data || data,
      total: data.total || data.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
  } catch (error) {
    // 网络错误或其他异常，切换到mock数据
    console.warn('⚠️ 网络错误或API不可用，切换到Mock数据模式:', error);
    useMockInterviewData = true;

    let filtered = mockInterviews;
    if (params.status) filtered = filtered.filter((i) => i.status === params.status);
    if (params.stage) filtered = filtered.filter((i) => i.stage === params.stage);

    console.log('📊 [Mock] 返回Mock数据:', filtered.length, '条记录');

    return {
      data: filtered.slice(0, params.pageSize || 10),
      total: filtered.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
  }
}

/**
 * 获取面试详情
 */
export async function fetchInterview(id: string) {
  if (useMockInterviewData) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const interview = mockInterviews.find((i) => i.id === id);
    if (!interview) {
      throw new Error('面试不存在');
    }
    return interview;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/interviews/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.warn('⚠️ API调用失败，切换到Mock数据模式');
      useMockInterviewData = true;
      const interview = mockInterviews.find((i) => i.id === id);
      if (!interview) throw new Error('面试不存在');
      return interview;
    }

    return response.json();
  } catch (error) {
    console.warn('⚠️ 网络错误，切换到Mock数据模式:', error);
    useMockInterviewData = true;
    const interview = mockInterviews.find((i) => i.id === id);
    if (!interview) throw new Error('面试不存在');
    return interview;
  }
}

/**
 * 获取日历视图数据
 */
export async function fetchCalendarEvents(params: {
  startDate: string;
  endDate: string;
  interviewerId?: string;
}) {
  if (useMockInterviewData) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    // 将mock interviews转换为日历事件格式
    return mockInterviews.map((interview) => ({
      id: interview.id,
      title: interview.title,
      start: interview.scheduledAt,
      end: new Date(new Date(interview.scheduledAt).getTime() + interview.duration * 60000).toISOString(),
      candidateName: interview.application?.candidate?.name || '未知',
      status: interview.status,
      type: interview.type,
    }));
  }

  try {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    if (params.interviewerId) {
      queryParams.append('interviewerId', params.interviewerId);
    }

    const response = await fetch(`${API_BASE_URL}/api/interviews/calendar?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.warn('⚠️ API调用失败，切换到Mock数据模式');
      useMockInterviewData = true;
      return mockInterviews.map((interview) => ({
        id: interview.id,
        title: interview.title,
        start: interview.scheduledAt,
        end: new Date(new Date(interview.scheduledAt).getTime() + interview.duration * 60000).toISOString(),
        candidateName: interview.application?.candidate?.name || '未知',
        status: interview.status,
        type: interview.type,
      }));
    }

    return response.json();
  } catch (error) {
    console.warn('⚠️ 网络错误，切换到Mock数据模式:', error);
    useMockInterviewData = true;
    return mockInterviews.map((interview) => ({
      id: interview.id,
      title: interview.title,
      start: interview.scheduledAt,
      end: new Date(new Date(interview.scheduledAt).getTime() + interview.duration * 60000).toISOString(),
      candidateName: interview.application?.candidate?.name || '未知',
      status: interview.status,
      type: interview.type,
    }));
  }
}

/**
 * 获取面试统计数据
 */
export async function fetchInterviewStats(interviewerId?: string) {
  if (useMockInterviewData) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockInterviewStats;
  }

  try {
    const params = interviewerId ? `?interviewerId=${interviewerId}` : '';
    const response = await fetch(`${API_BASE_URL}/api/interviews/stats/summary${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.warn('⚠️ API调用失败，切换到Mock数据模式');
      useMockInterviewData = true;
      return mockInterviewStats;
    }

    return response.json();
  } catch (error) {
    console.warn('⚠️ 网络错误，切换到Mock数据模式:', error);
    useMockInterviewData = true;
    return mockInterviewStats;
  }
}

/**
 * 创建面试
 */
export async function createInterview(data: any) {
  if (useMockInterviewData) {
    // Mock模式：返回成功的创建结果
    await new Promise((resolve) => setTimeout(resolve, 800)); // 稍微慢一点模拟真实请求
    console.log('📝 [Mock API] 创建面试请求:', data);

    // 验证候选人
    const candidate = mockCandidates.find(c => c.id === data.candidateId);
    if (!candidate) {
      const error = new Error(`候选人不存在（ID: ${data.candidateId}）`);
      console.error('❌ [Mock API] ' + error.message);
      throw error;
    }

    // 查找候选人的应聘记录（如果没有，创建一个默认的）
    let application = mockApplications.find(app => app.candidateId === data.candidateId);
    if (!application) {
      console.log('📝 [Mock API] 为候选人创建默认应聘记录');
      application = {
        id: `app-mock-${Date.now()}`,
        candidateId: data.candidateId,
        jobId: mockJobs[0].id,
        status: 'APPLIED',
        createdAt: new Date().toISOString(),
      };
      mockApplications.push(application);
      console.log('✅ [Mock API] 默认应聘记录已创建');
    }

    const newInterview = {
      id: `interview-mock-${Date.now()}`,
      applicationId: application.id,
      interviewerId: mockUsers[0].id,
      title: data.title,
      type: data.type,
      stage: data.stage,
      scheduledAt: data.scheduledAt,
      duration: data.duration,
      location: data.location || '',
      notes: data.notes || '',
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      application: {
        id: application.id,
        candidate: candidate,
        job: mockJobs[0],
      },
      interviewer: mockUsers[0],
    };

    mockInterviews.unshift(newInterview);
    console.log('✅ [Mock API] 面试创建成功:', newInterview);
    return newInterview;
  }

  console.log('📤 [API] 创建面试请求:', data);

  try {
    const response = await fetch(`${API_BASE_URL}/api/interviews`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(`📥 [API] 响应状态: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      console.error('❌ [API] 创建面试失败:', errorData);

      // 创建一个包含响应信息的错误对象
      const error: any = new Error(errorData.message || '创建面试失败');
      error.response = {
        ok: false,
        status: response.status,
        statusText: response.statusText,
        json: async () => errorData,
      };
      throw error;
    }

    const result = await response.json();
    console.log('✅ [API] 面试创建成功:', result);
    return result;
  } catch (error: any) {
    // 如果是网络错误或后端不可用，切换到Mock模式
    console.warn('⚠️ [API] 后端不可用，切换到Mock模式');
    useMockInterviewData = true;

    // 用Mock模式重试
    return createInterview(data);
  }
}

/**
 * 更新面试
 */
export async function updateInterview(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/api/interviews/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('更新面试失败');
  }

  return response.json();
}

/**
 * 删除面试
 */
export async function deleteInterview(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/interviews/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('删除面试失败');
  }

  return { success: true };
}

/**
 * 提交面试反馈
 */
export async function submitInterviewFeedback(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/api/interviews/${id}/feedback`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('提交反馈失败');
  }

  return response.json();
}

// ============ Application APIs ============

/**
 * 获取应聘列表（对接真实后端API）
 */
export async function fetchApplications(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  jobId?: string;
  candidateId?: string;
  status?: string;
  source?: string;
}) {
  // Mock模式：返回mock数据
  if (useMockData) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    let allApps = Object.values(mockKanbanData).flat();

    if (params.status) {
      allApps = allApps.filter((app) => app.status === params.status);
    }
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      allApps = allApps.filter((app) =>
        app.candidate?.name?.toLowerCase().includes(searchLower) ||
        app.candidate?.email?.toLowerCase().includes(searchLower)
      );
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;

    return {
      data: allApps.slice(start, start + pageSize),
      total: allApps.length,
      page,
      pageSize,
    };
  }

  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.jobId) queryParams.append('jobId', params.jobId);
    if (params.candidateId) queryParams.append('candidateId', params.candidateId);
    if (params.status) queryParams.append('status', params.status);
    if (params.source) queryParams.append('source', params.source);
    queryParams.append('skip', String(((params.page || 1) - 1) * (params.pageSize || 10)));
    queryParams.append('take', String(params.pageSize || 10));

    const response = await fetch(`${API_BASE_URL}/api/applications?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    // API调用失败时，切换到mock数据
    if (!response.ok) {
      console.warn('⚠️ API调用失败，切换到Mock数据模式');
      useMockData = true;
      let allApps = Object.values(mockKanbanData).flat();
      return {
        data: allApps,
        total: allApps.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
      };
    }

    const data = await response.json();
    return {
      data: data.data || data,
      total: data.total || data.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
  } catch (error) {
    // 网络错误或其他异常，切换到mock数据
    console.warn('⚠️ 网络错误或API不可用，切换到Mock数据模式:', error);
    useMockData = true;
    let allApps = Object.values(mockKanbanData).flat();
    return {
      data: allApps,
      total: allApps.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
  }
}

// Mock看板数据用于测试拖拽功能
const mockKanbanData: Record<string, any[]> = {
  APPLIED: [
    {
      id: 'app1',
      candidateId: '1',
      jobId: 'j1',
      status: 'APPLIED',
      matchScore: 85,
      appliedAt: '2026-03-08T00:00:00.000Z',
      candidate: { name: '张伟', currentCompany: '腾讯游戏', email: 'zhangwei@example.com' },
    },
    {
      id: 'app2',
      candidateId: '2',
      jobId: 'j1',
      status: 'APPLIED',
      matchScore: 78,
      appliedAt: '2026-03-09T00:00:00.000Z',
      candidate: { name: '李娜', currentCompany: '米哈游', email: 'lina@example.com' },
    },
  ],
  SCREENING: [
    {
      id: 'app3',
      candidateId: '3',
      jobId: 'j2',
      status: 'SCREENING',
      matchScore: 92,
      appliedAt: '2026-03-07T00:00:00.000Z',
      candidate: { name: '王强', currentCompany: '网易游戏', email: 'wangqiang@example.com' },
    },
  ],
  REVIEWED: [
    {
      id: 'app4',
      candidateId: '4',
      jobId: 'j1',
      status: 'REVIEWED',
      matchScore: 88,
      appliedAt: '2026-03-06T00:00:00.000Z',
      candidate: { name: '赵敏', currentCompany: '字节跳动', email: 'zhaomin@example.com' },
    },
  ],
  SHORTLISTED: [
    {
      id: 'app5',
      candidateId: '5',
      jobId: 'j2',
      status: 'SHORTLISTED',
      matchScore: 90,
      appliedAt: '2026-03-05T00:00:00.000Z',
      candidate: { name: '孙悟空', currentCompany: '莉莉丝游戏', email: 'wukong@example.com' },
    },
  ],
  INTERVIEWING: [
    {
      id: 'app6',
      candidateId: '6',
      jobId: 'j1',
      status: 'INTERVIEWING',
      matchScore: 95,
      appliedAt: '2026-03-04T00:00:00.000Z',
      candidate: { name: '猪八戒', currentCompany: '完美世界', email: 'bajie@example.com' },
    },
  ],
  OFFERED: [
    {
      id: 'app7',
      candidateId: '7',
      jobId: 'j2',
      status: 'OFFERED',
      matchScore: 93,
      appliedAt: '2026-03-03T00:00:00.000Z',
      candidate: { name: '沙僧', currentCompany: '游族网络', email: 'shaseng@example.com' },
    },
  ],
  HIRED: [
    {
      id: 'app8',
      candidateId: '8',
      jobId: 'j1',
      status: 'HIRED',
      matchScore: 91,
      appliedAt: '2026-03-01T00:00:00.000Z',
      candidate: { name: '唐僧', currentCompany: '三七互娱', email: 'tangseng@example.com' },
    },
  ],
  REJECTED: [
    {
      id: 'app9',
      candidateId: '9',
      jobId: 'j2',
      status: 'REJECTED',
      matchScore: 45,
      appliedAt: '2026-03-02T00:00:00.000Z',
      candidate: { name: '白龙马', currentCompany: '某小厂', email: 'bailong@example.com' },
    },
  ],
};

const mockApplicationStats = {
  total: 9,
  todayApplied: 2,
  byStatus: {
    APPLIED: 2,
    SCREENING: 1,
    REVIEWED: 1,
    SHORTLISTED: 1,
    INTERVIEWING: 1,
    OFFERED: 1,
    HIRED: 1,
    REJECTED: 1,
  },
  hireRate: 11,
};

// 是否使用Mock数据（当后端API不可用时自动切换）
let useMockData = false;

/**
 * 获取看板视图数据（按状态分组）
 */
export async function fetchKanbanData(jobId?: string) {
  // 如果已经标记为使用mock数据，直接返回
  if (useMockData) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockKanbanData;
  }

  try {
    const queryParams = jobId ? `?jobId=${jobId}` : '';
    const response = await fetch(`${API_BASE_URL}/api/applications/kanban${queryParams}`, {
      headers: getAuthHeaders(),
    });

    // API调用失败时，切换到mock数据
    if (!response.ok) {
      console.warn('⚠️ API调用失败，切换到Mock数据模式');
      useMockData = true;
      return mockKanbanData;
    }

    return response.json();
  } catch (error) {
    // 网络错误或其他异常，切换到mock数据
    console.warn('⚠️ 网络错误或API不可用，切换到Mock数据模式:', error);
    useMockData = true;
    return mockKanbanData;
  }
}

/**
 * 获取应聘统计数据
 */
export async function fetchApplicationStats(jobId?: string) {
  // 如果已经标记为使用mock数据，直接返回
  if (useMockData) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockApplicationStats;
  }

  try {
    const params = jobId ? `?jobId=${jobId}` : '';
    const response = await fetch(`${API_BASE_URL}/api/applications/stats/summary${params}`, {
      headers: getAuthHeaders(),
    });

    // API调用失败时，切换到mock数据
    if (!response.ok) {
      console.warn('⚠️ API调用失败，切换到Mock数据模式');
      useMockData = true;
      return mockApplicationStats;
    }

    return response.json();
  } catch (error) {
    // 网络错误或其他异常，切换到mock数据
    console.warn('⚠️ 网络错误或API不可用，切换到Mock数据模式:', error);
    useMockData = true;
    return mockApplicationStats;
  }
}

/**
 * 获取应聘详情
 */
export async function fetchApplication(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取应聘详情失败');
  }

  return response.json();
}

/**
 * 创建应聘记录
 */
export async function createApplication(data: any) {
  console.log('🚀 创建应聘记录 - 发送数据:', data);

  const response = await fetch(`${API_BASE_URL}/api/applications`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log('📡 响应状态:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ 创建失败 - 响应内容:', errorText);

    let errorMessage = '创建应聘记录失败';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
      if (errorJson.statusCode === 401) {
        errorMessage = '未授权，请先登录';
      } else if (errorJson.statusCode === 403) {
        errorMessage = '权限不足，无法创建应聘记录';
      } else if (errorJson.statusCode === 409) {
        errorMessage = '该候选人已应聘此职位';
      } else if (errorJson.statusCode === 404) {
        errorMessage = errorJson.message || '职位或候选人不存在';
      }
    } catch (e) {
      errorMessage = `创建失败 (HTTP ${response.status}): ${errorText}`;
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('✅ 创建成功:', result);
  return result;
}

/**
 * 更新应聘信息
 */
export async function updateApplication(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('更新应聘信息失败');
  }

  return response.json();
}

/**
 * 删除应聘记录
 */
export async function deleteApplication(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('删除应聘记录失败');
  }

  return { success: true };
}

/**
 * 更新应聘状态
 */
export async function updateApplicationStatus(id: string, status: string, notes?: string) {
  // Mock模式：更新本地数据
  if (useMockData) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 在mock数据中查找并更新
    for (const columnStatus in mockKanbanData) {
      const appIndex = mockKanbanData[columnStatus].findIndex((app) => app.id === id);
      if (appIndex !== -1) {
        const app = mockKanbanData[columnStatus][appIndex];
        mockKanbanData[columnStatus].splice(appIndex, 1);
        app.status = status;
        mockKanbanData[status].push(app);
        console.log(`✅ Mock模式：已将应聘 ${id} 从 ${columnStatus} 移动到 ${status}`);
        return app;
      }
    }

    throw new Error('应聘记录不存在');
  }

  const response = await fetch(`${API_BASE_URL}/api/applications/${id}/status`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notes }),
  });

  if (!response.ok) {
    throw new Error('更新应聘状态失败');
  }

  return response.json();
}

/**
 * 筛选候选人
 */
export async function screenApplication(id: string, data: {
  screeningScore?: number;
  screeningNotes?: string;
  passed?: boolean;
}) {
  const response = await fetch(`${API_BASE_URL}/api/applications/${id}/screen`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('筛选候选人失败');
  }

  return response.json();
}

/**
 * 批量更新应聘状态
 */
export async function batchUpdateApplicationStatus(ids: string[], status: string) {
  const response = await fetch(`${API_BASE_URL}/api/applications/batch/status`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids, status }),
  });

  if (!response.ok) {
    throw new Error('批量更新状态失败');
  }

  return response.json();
}

// ============ Education APIs ============

/**
 * 获取候选人教育经历列表
 */
export async function fetchCandidateEducation(candidateId: string) {
  const response = await fetch(`${API_BASE_URL}/api/education/candidate/${candidateId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取教育经历失败');
  }

  return response.json();
}

/**
 * 获取单个教育经历
 */
export async function fetchEducation(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/education/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取教育经历失败');
  }

  return response.json();
}

/**
 * 创建教育经历
 */
export async function createEducation(data: any) {
  const response = await fetch(`${API_BASE_URL}/api/education`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '创建教育经历失败' }));
    throw new Error(error.message || '创建教育经历失败');
  }

  return response.json();
}

/**
 * 更新教育经历
 */
export async function updateEducation(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/api/education/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '更新教育经历失败' }));
    throw new Error(error.message || '更新教育经历失败');
  }

  return response.json();
}

/**
 * 删除教育经历
 */
export async function deleteEducation(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/education/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '删除教育经历失败' }));
    throw new Error(error.message || '删除教育经历失败');
  }

  return response.json();
}

/**
 * 批量创建教育经历
 */
export async function batchCreateEducation(candidateId: string, data: any[]) {
  const response = await fetch(`${API_BASE_URL}/api/education/batch/${candidateId}`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '批量创建教育经历失败' }));
    throw new Error(error.message || '批量创建教育经历失败');
  }

  return response.json();
}

// ============ Work Experience APIs ============

/**
 * 获取候选人工工作经历列表
 */
export async function fetchCandidateWorkExperience(candidateId: string) {
  const response = await fetch(`${API_BASE_URL}/api/work-experience/candidate/${candidateId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取工作经历失败');
  }

  return response.json();
}

/**
 * 获取单个工作经历
 */
export async function fetchWorkExperience(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/work-experience/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取工作经历失败');
  }

  return response.json();
}

/**
 * 创建工作经历
 */
export async function createWorkExperience(data: any) {
  const response = await fetch(`${API_BASE_URL}/api/work-experience`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '创建工作经历失败' }));
    throw new Error(error.message || '创建工作经历失败');
  }

  return response.json();
}

/**
 * 更新工作经历
 */
export async function updateWorkExperience(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/api/work-experience/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '更新工作经历失败' }));
    throw new Error(error.message || '更新工作经历失败');
  }

  return response.json();
}

/**
 * 删除工作经历
 */
export async function deleteWorkExperience(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/work-experience/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '删除工作经历失败' }));
    throw new Error(error.message || '删除工作经历失败');
  }

  return response.json();
}

/**
 * 批量创建工作经历
 */
export async function batchCreateWorkExperience(candidateId: string, data: any[]) {
  const response = await fetch(`${API_BASE_URL}/api/work-experience/batch/${candidateId}`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '批量创建工作经历失败' }));
    throw new Error(error.message || '批量创建工作经历失败');
  }

  return response.json();
}

// ============ Job Match APIs ============

/**
 * 计算候选人和职位的匹配度
 */
export async function calculateMatch(candidateId: string, jobId: string) {
  const response = await fetch(`${API_BASE_URL}/api/job-match/calculate`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ candidateId, jobId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '计算匹配度失败' }));
    throw new Error(error.message || '计算匹配度失败');
  }

  return response.json();
}

/**
 * 批量计算匹配度
 */
export async function batchCalculateMatch(jobId: string, candidateIds: string[]) {
  const response = await fetch(`${API_BASE_URL}/api/job-match/batch`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId, candidateIds }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '批量计算匹配度失败' }));
    throw new Error(error.message || '批量计算匹配度失败');
  }

  return response.json();
}

/**
 * 获取职位的最佳匹配候选人
 */
export async function getBestMatches(jobId: string, limit = 10) {
  const response = await fetch(`${API_BASE_URL}/api/job-match/best/${jobId}?limit=${limit}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取最佳匹配失败');
  }

  return response.json();
}

/**
 * 为职位的所有候选人计算匹配度
 */
export async function calculateAllForJob(jobId: string) {
  const response = await fetch(`${API_BASE_URL}/api/job-match/calculate-all/${jobId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '批量计算失败' }));
    throw new Error(error.message || '批量计算失败');
  }

  return response.json();
}

/**
 * 获取职位匹配度统计
 */
export async function getMatchStatistics(jobId: string) {
  const response = await fetch(`${API_BASE_URL}/api/job-match/statistics/${jobId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取匹配统计失败');
  }

  return response.json();
}

/**
 * 提取简历技能
 */
export async function extractSkills(resumeId: string) {
  const response = await fetch(`${API_BASE_URL}/api/job-match/extract-skills`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '提取技能失败' }));
    throw new Error(error.message || '提取技能失败');
  }

  return response.json();
}

/**
 * 分析竞品公司
 */
export async function analyzeCompetitor(resumeId: string) {
  const response = await fetch(`${API_BASE_URL}/api/job-match/analyze-competitor`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '分析竞品失败' }));
    throw new Error(error.message || '分析竞品失败');
  }

  return response.json();
}

/**
 * 清除候选人缓存
 */
export async function invalidateCandidateCache(candidateId: string) {
  const response = await fetch(`${API_BASE_URL}/api/job-match/invalidate-cache/candidate/${candidateId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('清除缓存失败');
  }

  return { success: true };
}

/**
 * 清除职位缓存
 */
export async function invalidateJobCache(jobId: string) {
  const response = await fetch(`${API_BASE_URL}/api/job-match/invalidate-cache/job/${jobId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('清除缓存失败');
  }

  return { success: true };
}

// ============================================
// Analytics API
// ============================================

interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
  conversionRate?: number;
}

interface ConversionRate {
  stage: string;
  toNext: number;
  toOffer: number;
}

interface TimeCycleData {
  stage: string;
  averageDays: number;
  medianDays: number;
  minDays: number;
  maxDays: number;
}

interface SourceEffect {
  source: string;
  candidates: number;
  applications: number;
  interviews: number;
  offers: number;
  conversionRate: number;
  avgMatchScore: number;
}

interface DashboardOverview {
  summary: {
    totalCandidates: number;
    totalApplications: number;
    activeJobs: number;
    totalInterviews: number;
    offersSent: number;
    currentApplications: number;
    conversionRate: number;
  };
  trend: Array<{
    date: string;
    applications: number;
    offers: number;
    interviews: number;
  }>;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

/**
 * 获取招聘漏斗分析
 */
export async function fetchFunnelAnalysis(params?: {
  jobId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ funnel: FunnelData[]; overallConversionRate: number }> {
  const queryParams = new URLSearchParams();
  if (params?.jobId) queryParams.append('jobId', params.jobId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const response = await fetch(`${API_BASE_URL}/api/analytics/funnel?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取漏斗分析失败');
  }

  return response.json();
}

/**
 * 获取转化率分析
 */
export async function fetchConversionRates(params?: {
  jobId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ conversions: ConversionRate[]; summary: any }> {
  const queryParams = new URLSearchParams();
  if (params?.jobId) queryParams.append('jobId', params.jobId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const response = await fetch(`${API_BASE_URL}/api/analytics/conversion?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取转化率分析失败');
  }

  return response.json();
}

/**
 * 获取时间周期分析
 */
export async function fetchTimeCycleAnalysis(params?: {
  jobId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ timeCycles: TimeCycleData[]; sampleSize: number }> {
  const queryParams = new URLSearchParams();
  if (params?.jobId) queryParams.append('jobId', params.jobId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const response = await fetch(`${API_BASE_URL}/api/analytics/time-cycle?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取时间周期分析失败');
  }

  return response.json();
}

/**
 * 获取来源效果分析
 */
export async function fetchSourceEffectiveness(params?: {
  startDate?: string;
  endDate?: string;
  minCandidates?: string;
}): Promise<{ sources: SourceEffect[] }> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.minCandidates) queryParams.append('minCandidates', params.minCandidates);

  const response = await fetch(`${API_BASE_URL}/api/analytics/source-effectiveness?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取来源效果分析失败');
  }

  return response.json();
}

/**
 * 获取仪表板总览
 */
export async function fetchDashboardOverview(params?: {
  jobId?: string;
  days?: number;
}): Promise<DashboardOverview> {
  const queryParams = new URLSearchParams();
  if (params?.jobId) queryParams.append('jobId', params.jobId);
  if (params?.days) queryParams.append('days', params.days.toString());

  const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取仪表板总览失败');
  }

  return response.json();
}
