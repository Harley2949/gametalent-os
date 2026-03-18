'use client';

// React
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Next.js
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Hooks
import { useToast } from '@/components/shared/Toast';

// Mock Data
import { MOCK_APPLICATIONS, MOCK_STATS, MOCK_CANDIDATES, MOCK_JOBS } from '@/lib/mockData';

// Shared Components
import { BackHeader } from '@/components/ui/BackHeader';
import { ApplicationErrorBoundary } from '@/components/applications/ApplicationErrorBoundary';
import { ApplicationStatsCards } from '@/components/applications/ApplicationStatsCards';
import { ApplicationFilters } from '@/components/applications/ApplicationFilters';
import { ApplicationContent } from '@/components/applications/ApplicationContent';
import { ApplicationListView } from '@/components/applications/ApplicationListView';
import { ApplicationKanbanView } from '@/components/applications/ApplicationKanbanView';

// UI Components
import { Button } from '@gametalent/ui';
import { Badge } from '@gametalent/ui';

// Icons
import { Plus } from 'lucide-react';

// Types
import {
  Application,
  ApplicationStats,
  ApplicationStatus,
  ApplicationStatusLabels,
} from '@/types/application';

type ViewMode = 'list' | 'kanban';

export default function ApplicationsPage() {
  const searchParams = useSearchParams();
  const toast = useToast();

  // 状态管理
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [jobFilter, setJobFilter] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [kanbanData, setKanbanData] = useState<Record<string, Application[]>>({
    APPLIED: MOCK_APPLICATIONS.filter(app => app.status === 'APPLIED'),
    HR_INITIAL_CONTACT: MOCK_APPLICATIONS.filter(app => app.status === 'HR_INITIAL_CONTACT'),
    BUSINESS_SCREENING: MOCK_APPLICATIONS.filter(app => app.status === 'BUSINESS_SCREENING'),
    BUSINESS_FIRST_INTERVIEW: MOCK_APPLICATIONS.filter(app => app.status === 'BUSINESS_FIRST_INTERVIEW'),
    BUSINESS_SECOND_INTERVIEW: MOCK_APPLICATIONS.filter(app => app.status === 'BUSINESS_SECOND_INTERVIEW'),
    HR_FINAL_INTERVIEW: MOCK_APPLICATIONS.filter(app => app.status === 'HR_FINAL_INTERVIEW'),
    CEO_INTERVIEW: MOCK_APPLICATIONS.filter(app => app.status === 'CEO_INTERVIEW'),
    OFFER_PENDING: MOCK_APPLICATIONS.filter(app => app.status === 'OFFER_PENDING'),
    PENDING_ONBOARDING: MOCK_APPLICATIONS.filter(app => app.status === 'PENDING_ONBOARDING'),
    HIRED: MOCK_APPLICATIONS.filter(app => app.status === 'HIRED'),
    ARCHIVED: MOCK_APPLICATIONS.filter(app => app.status === 'ARCHIVED'),
    BLACKLISTED: MOCK_APPLICATIONS.filter(app => app.status === 'BLACKLISTED'),
  });
  const [stats] = useState<ApplicationStats>(MOCK_STATS);

  // ⚡ 性能优化：静态数据不使用 state，避免不必要的重渲染
  const candidates = MOCK_CANDIDATES;
  const jobs = MOCK_JOBS;

  // 拖拽状态
  const [draggedApplication, setDraggedApplication] = useState<Application | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // 使用 ref 存储最新状态，避免闭包问题
  const draggedAppRef = useRef<Application | null>(null);

  // 更新 ref 当状态变化时
  useEffect(() => {
    draggedAppRef.current = draggedApplication;
  }, [draggedApplication]);

  // 清除搜索防抖定时器，防止内存泄漏
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 根据URL参数筛选数据
  useEffect(() => {
    const filter = searchParams.get('filter');
    const status = searchParams.get('status');

    let filtered = MOCK_APPLICATIONS;

    // 根据filter参数筛选
    if (filter === 'all') {
      filtered = MOCK_APPLICATIONS;
    } else if (filter === 'today') {
      filtered = MOCK_APPLICATIONS.filter(app => app.status === 'APPLIED');
    }

    // 根据status参数筛选
    if (status) {
      filtered = filtered.filter(app => app.status === status);
    }

    setApplications(filtered);
  }, [searchParams]);

  // 辅助函数
  const getCandidateName = useCallback((candidateId: string) => {
    const candidate = candidates.find((c) => c?.id === candidateId);
    return candidate?.name || '未知';
  }, [candidates]);

  const getCandidateCompany = useCallback((candidateId: string) => {
    const candidate = candidates.find((c) => c?.id === candidateId);
    return candidate?.currentCompany || '';
  }, [candidates]);

  const getJobTitle = useCallback((jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    return job?.title || '未知';
  }, [jobs]);

  // 应用手动筛选（搜索、状态、职位）
  const filteredApplications = useMemo(() => {
    let result = applications;

    // 搜索筛选（候选人姓名、邮箱、公司）
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(app => {
        const candidateName = getCandidateName(app.candidateId)?.toLowerCase() || '';
        const candidate = candidates.find(c => c?.id === app.candidateId);
        const candidateEmail = candidate?.email?.toLowerCase() || '';
        const candidateCompany = candidate?.currentCompany?.toLowerCase() || '';

        return (
          candidateName.includes(searchLower) ||
          candidateEmail.includes(searchLower) ||
          candidateCompany.includes(searchLower)
        );
      });
    }

    // 状态筛选
    if (statusFilter) {
      result = result.filter(app => app.status === statusFilter);
    }

    // 职位筛选
    if (jobFilter) {
      result = result.filter(app => app.jobId === jobFilter);
    }

    return result;
  }, [applications, search, statusFilter, jobFilter, getCandidateName, candidates]);

  // 根据筛选后的数据更新看板
  useEffect(() => {
    const newKanbanData: Record<string, Application[]> = {
      APPLIED: [],
      HR_INITIAL_CONTACT: [],
      BUSINESS_SCREENING: [],
      BUSINESS_FIRST_INTERVIEW: [],
      BUSINESS_SECOND_INTERVIEW: [],
      HR_FINAL_INTERVIEW: [],
      CEO_INTERVIEW: [],
      OFFER_PENDING: [],
      PENDING_ONBOARDING: [],
      HIRED: [],
      ARCHIVED: [],
      BLACKLISTED: [],
    };

    filteredApplications.forEach(app => {
      if (newKanbanData[app.status]) {
        newKanbanData[app.status].push(app);
      }
    });

    setKanbanData(newKanbanData);
  }, [filteredApplications]);

  // 搜索和筛选处理
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((value: string) => {
    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 设置新的定时器，300ms 后更新搜索值
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handleJobFilter = useCallback((value: string) => {
    setJobFilter(value);
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilter('');
    setJobFilter('');
    setSearch('');
  }, []);

  const hasActiveFilters = Boolean(statusFilter || jobFilter || search);

  // 拖拽事件处理
  const handleDragStart = useCallback((e: React.DragEvent, application: Application) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('applicationId', application.id);
    setDraggedApplication(application);
    draggedAppRef.current = application;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const { clientX, clientY } = e;

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setDragOverStatus(null);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, newStatus: ApplicationStatus) => {
    e.preventDefault();
    setDragOverStatus(null);

    const applicationId = e.dataTransfer.getData('applicationId');
    const currentDraggedApp = draggedAppRef.current;

    if (!applicationId || !currentDraggedApp) {
      return;
    }

    // 如果状态没变化，不做处理
    if (currentDraggedApp.status === newStatus) {
      setDraggedApplication(null);
      return;
    }

    try {
      setUpdatingStatus(applicationId);

      // 🔧 开发模式：跳过API调用，直接更新本地数据
      // 更新本地数据
      setKanbanData((prev) => {
        const updated = { ...prev };
        const oldStatus = currentDraggedApp.status;

        updated[oldStatus] = updated[oldStatus].filter(
          (app) => app.id !== applicationId
        );

        updated[newStatus] = [
          ...updated[newStatus],
          { ...currentDraggedApp, status: newStatus },
        ];

        return updated;
      });

      toast.success(`✅ 已移动到：${newStatus}`);
    } catch (error: any) {
      console.error('❌ 更新状态失败:', error);
      toast.error('更新状态失败，请重试');
    } finally {
      setUpdatingStatus(null);
      setDraggedApplication(null);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedApplication(null);
    draggedAppRef.current = null;
    setDragOverStatus(null);
  }, []);

  return (
    <ApplicationErrorBoundary>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <BackHeader />

        {/* 页头 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">应聘管理</h1>
            <p className="mt-2 text-sm text-gray-600">
              {hasActiveFilters
                ? `显示 ${filteredApplications.length} / ${stats.total} 条应聘记录`
                : stats
                ? `共 ${stats.total} 条应聘记录`
                : '管理候选人应聘流程'}
            </p>
            {viewMode === 'kanban' && (
              <p className="text-sm text-blue-600 mt-1">
                💡 提示：拖拽应聘卡片可快速更新状态
              </p>
            )}
          </div>
          <Link href="/applications/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              创建应聘记录
            </Button>
          </Link>
        </div>

        {/* 统计卡片模块 */}
        <ApplicationStatsCards stats={stats} />

        {/* 搜索和筛选模块 */}
        <ApplicationFilters
          search={search}
          onSearchChange={handleSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilter}
          jobFilter={jobFilter}
          onJobFilterChange={handleJobFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          jobs={jobs}
        />

        {/* 筛选提示 */}
        {(searchParams.get('filter') || searchParams.get('status')) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-blue-600">
                筛选中
              </Badge>
              <span className="text-sm text-blue-800">
                {searchParams.get('filter') === 'today' && '显示：今日新增（已申请状态）'}
                {searchParams.get('filter') === 'all' && '显示：所有应聘记录'}
                {searchParams.get('status') === 'INTERVIEWING' && '显示：面试中的应聘'}
                {searchParams.get('status') === 'HIRED' && '显示：已录用的应聘'}
              </span>
            </div>
            <Link href="/applications">
              <Button variant="secondary" size="sm" className="text-blue-700 hover:text-blue-900">
                清除筛选
              </Button>
            </Link>
          </div>
        )}

        {/* 空状态提示 - 当筛选结果为空时显示 */}
        {filteredApplications.length === 0 && hasActiveFilters && (
          <div className="mb-6 p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-sm text-yellow-800 mb-2">没有找到匹配的应聘记录</p>
            <p className="text-xs text-yellow-600">请尝试调整筛选条件或清除筛选</p>
          </div>
        )}

        {/* 内容区域 */}
        {viewMode === 'list' ? (
          <ApplicationListView
            applications={filteredApplications}
            getCandidateName={getCandidateName}
            getCandidateCompany={getCandidateCompany}
            getJobTitle={getJobTitle}
          />
        ) : (
          <ApplicationKanbanView
            kanbanData={kanbanData}
            dragOverStatus={dragOverStatus}
            updatingStatus={updatingStatus}
            draggedApplication={draggedApplication}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            getCandidateName={getCandidateName}
            getJobTitle={getJobTitle}
          />
        )}
      </div>
    </div>
    </ApplicationErrorBoundary>
  );
}
