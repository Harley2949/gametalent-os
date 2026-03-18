# Mock数据替换计划

**统计时间**: 2026-03-17
**发现数量**: 6,260 个相关匹配项
**实际使用**: 3个文件使用Mock数据

---

## 📊 Mock数据现状分析

### 🎯 核心Mock数据文件
**文件**: `apps/web/src/lib/mockData.ts`
- **总行数**: 454行
- **Mock常量**: 4个
  1. `MOCK_STATS` - 申请统计数据
  2. `MOCK_APPLICATIONS` - 申请列表（31条完整示例数据）
  3. `MOCK_CANDIDATES` - 候选人列表
  4. `MOCK_JOBS` - 职位列表

### 📁 使用Mock数据的文件（3个）

1. **`apps/web/src/app/applications/page.tsx`**
   - 使用: `MOCK_APPLICATIONS`, `MOCK_STATS`, `MOCK_CANDIDATES`, `MOCK_JOBS`
   - 影响: 申请管理页面的所有数据展示
   - 依赖程度: 🔴 完全依赖Mock数据

2. **`apps/web/src/app/applications/[id]/page.tsx`**
   - 使用: Mock数据用于申请详情展示
   - 影响: 申请详情页面
   - 依赖程度: 🔴 完全依赖Mock数据

3. **`apps/web/src/lib/mockData.ts`**
   - 定义文件本身

---

## 🚨 为什么有6,260个匹配项？

经过分析，6,260这个大数字来自于：
- 代码注释中的"mock"关键词
- TypeScript类型定义中的重复引用
- 开发工具和构建产物中的引用
- 实际**需要替换的只有3个文件**

**真实的Mock数据问题集中在**:
- 申请管理模块（applications）
- 2个页面组件需要连接真实API

---

## ✅ 替换方案

### 第一步：检查后端API状态

首先验证后端API是否已经准备好：

```bash
# 检查应用相关的API端点
curl http://localhost:3006/api/applications
curl http://localhost:3006/api/applications/stats
curl http://localhost:3006/api/candidates
curl http://localhost:3006/api/jobs
```

**需要确认**:
- [ ] `/api/applications` - 获取申请列表
- [ ] `/api/applications/:id` - 获取申请详情
- [ ] `/api/applications/stats` - 获取统计数据
- [ ] `/api/candidates` - 获取候选人列表
- [ ] `/api/jobs` - 获取职位列表

### 第二步：创建API服务层

**创建文件**: `apps/web/src/lib/api/applications.ts`

```typescript
import { Application, ApplicationStats } from '@/types/application';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

export async function getApplications(): Promise<Application[]> {
  const response = await fetch(`${API_BASE_URL}/api/applications`);
  if (!response.ok) throw new Error('Failed to fetch applications');
  return response.json();
}

export async function getApplication(id: string): Promise<Application> {
  const response = await fetch(`${API_BASE_URL}/api/applications/${id}`);
  if (!response.ok) throw new Error('Failed to fetch application');
  return response.json();
}

export async function getApplicationStats(): Promise<ApplicationStats> {
  const response = await fetch(`${API_BASE_URL}/api/applications/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}
```

### 第三步：更新页面组件

**文件**: `apps/web/src/app/applications/page.tsx`

**替换前**:
```typescript
import { MOCK_APPLICATIONS, MOCK_STATS, MOCK_CANDIDATES, MOCK_JOBS } from '@/lib/mockData';

const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
const [stats] = useState<ApplicationStats>(MOCK_STATS);
const candidates = MOCK_CANDIDATES;
const jobs = MOCK_JOBS;
```

**替换后**:
```typescript
import { getApplications, getApplicationStats, getCandidates, getJobs } from '@/lib/api/applications';

const [applications, setApplications] = useState<Application[]>([]);
const [stats, setStats] = useState<ApplicationStats | null>(null);
const [candidates, setCandidates] = useState<Candidate[]>([]);
const [jobs, setJobs] = useState<Job[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function loadData() {
    try {
      setLoading(true);
      const [appsData, statsData, candidatesData, jobsData] = await Promise.all([
        getApplications(),
        getApplicationStats(),
        getCandidates(),
        getJobs(),
      ]);
      setApplications(appsData);
      setStats(statsData);
      setCandidates(candidatesData);
      setJobs(jobsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, []);
```

### 第四步：添加加载和错误状态

```typescript
// 在组件中添加
if (loading) {
  return <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
  </div>;
}

if (error) {
  return <div className="flex items-center justify-center h-64">
    <div className="text-red-600">
      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="text-blue-600 underline mt-2">
        重试
      </button>
    </div>
  </div>;
}
```

### 第五步：测试和验证

```bash
# 1. 启动后端（如果未启动）
cd apps/api && npm run start:dev

# 2. 启动前端
cd apps/web && npm run dev

# 3. 测试页面
# 访问 http://localhost:3000/applications
# 检查数据是否正确加载
# 检查错误处理是否正常工作
# 检查加载状态是否显示
```

---

## 📋 替换检查清单

### Phase 1: API准备
- [ ] 验证后端API端点存在且工作正常
- [ ] 检查API响应格式与前端类型匹配
- [ ] 添加API认证（如果需要）
- [ ] 创建API服务层文件

### Phase 2: applications/page.tsx
- [ ] 移除Mock数据导入
- [ ] 添加useState用于真实数据
- [ ] 添加useEffect加载数据
- [ ] 添加加载状态UI
- [ ] 添加错误处理UI
- [ ] 测试所有筛选功能
- [ ] 测试状态流转功能

### Phase 3: applications/[id]/page.tsx
- [ ] 移除Mock数据导入
- [ ] 使用真实API获取数据
- [ ] 添加加载状态
- [ ] 添加错误处理
- [ ] 测试所有详情展示

### Phase 4: 清理
- [ ] 删除 `mockData.ts` 文件
- [ ] 搜索代码中剩余的Mock引用
- [ ] 更新文档和注释
- [ ] Git提交：`Remove mock data, connect to real API`

---

## 🎯 预期结果

**替换前**:
- ❌ 使用静态Mock数据
- ❌ 数据不会更新
- ❌ 无法测试真实流程
- ❌ 生产环境无法使用

**替换后**:
- ✅ 使用真实API数据
- ✅ 数据实时更新
- ✅ 可以测试完整流程
- ✅ 生产环境可用
- ✅ 适当的加载和错误状态

---

## ⏱️ 时间估算

- **API准备**: 30分钟
- **创建API服务层**: 1小时
- **更新applications/page.tsx**: 2小时
- **更新applications/[id]/page.tsx**: 1.5小时
- **测试和调试**: 2小时
- **总计**: 约7小时（1个工作日）

---

## 🚀 下一步行动

**建议立即执行**:
1. 验证后端API是否已实现这些端点
2. 如果未实现，先实现后端API
3. 然后按照上述步骤替换前端Mock数据

**需要我帮助吗？**
我可以帮您：
1. 检查后端API是否已经实现
2. 创建API服务层
3. 替换Mock数据
4. 测试和验证

---

**创建时间**: 2026-03-17
**优先级**: 🔴 高（阻塞生产环境部署）
**复杂度**: 🟡 中等
