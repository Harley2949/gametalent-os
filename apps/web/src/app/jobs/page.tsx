'use client';

// React
import { useState, useEffect } from 'react';

// Next.js
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Hooks
import { useToast } from '@/components/shared/Toast';

// Shared Components
import { TableSkeleton, EmptyState, StatsCardSkeleton } from '@/components/shared';

// UI Components
import { Button } from '@gametalent/ui';
import { Input } from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gametalent/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@gametalent/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@gametalent/ui';

// Icons
import { Plus, Search, Filter, X, Eye, Trash2, Users, Briefcase, FileText, TrendingUp, Inbox } from 'lucide-react';

// Shared Components
import { BackHeader } from '@/components/ui/BackHeader';

// API
import {
  fetchJobs,
  fetchJobStats,
  deleteJob,
  publishJob,
  closeJob,
  archiveJob,
} from '@/lib/api';

// Types
import {
  Job,
  JobStatus,
  JobStatusLabels,
  JobTypeLabels,
  PriorityLabels,
  ExperienceLevelLabels,
} from '@/types/job';

const statusMap = {
  DRAFT: { label: '草稿', color: 'bg-gray-100 text-gray-800' },
  PUBLISHED: { label: '已发布', color: 'bg-green-100 text-green-800' },
  CLOSED: { label: '已关闭', color: 'bg-yellow-100 text-yellow-800' },
  ARCHIVED: { label: '已归档', color: 'bg-blue-100 text-blue-800' },
};

const priorityMap = {
  URGENT: { label: '紧急', color: 'bg-red-100 text-red-800' },
  HIGH: { label: '高', color: 'bg-orange-100 text-orange-800' },
  MEDIUM: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
  LOW: { label: '低', color: 'bg-gray-100 text-gray-800' },
};

interface JobStats {
  total: number;
  published: number;
  draft: number;
  todayNew: number;
  closed: number;
  archived: number;
}

export default function JobsPage() {
  const router = useRouter();
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    loadJobs();
    loadStats();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [page, statusFilter, search]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const result = await fetchJobs({
        page,
        pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setJobs(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('加载职位列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await fetchJobStats();
      setStats(statsData);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters = statusFilter || search;

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    try {
      setDeleting(true);
      await deleteJob(jobToDelete.id);
      await loadJobs();
      await loadStats();
      setDeleteDialogOpen(false);
      setJobToDelete(null);
      toast.success('职位删除成功');
    } catch (error) {
      console.error('删除职位失败:', error);
      toast.error('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishJob(id);
      toast.success('职位发布成功');
      await loadJobs();
      await loadStats();
    } catch (error) {
      console.error('发布失败:', error);
      toast.error('发布失败，请重试');
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('确定要关闭这个职位吗？')) return;

    try {
      await closeJob(id);
      toast.success('职位已关闭');
      await loadJobs();
      await loadStats();
    } catch (error) {
      console.error('关闭失败:', error);
      toast.error('关闭失败，请重试');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('确定要归档这个职位吗？')) return;

    try {
      await archiveJob(id);
      toast.success('职位已归档');
      await loadJobs();
      await loadStats();
    } catch (error) {
      console.error('归档失败:', error);
      toast.error('归档失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <BackHeader />

        {/* 页头 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">职位管理</h1>
            <p className="mt-2 text-sm text-gray-600">
              共 {total} 个职位
            </p>
          </div>
          <Link href="/jobs/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新建职位
            </Button>
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="mb-6">
          {loading && !stats ? (
            <StatsCardSkeleton />
          ) : stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600 mt-1">总职位数</div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.published}</div>
                  <div className="text-sm text-gray-600 mt-1">已发布</div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.draft}</div>
                  <div className="text-sm text-gray-600 mt-1">草稿</div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.todayNew}</div>
                  <div className="text-sm text-gray-600 mt-1">今日新增</div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* 搜索和筛选栏 */}
        <div className="mb-6 space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索职位名称、部门..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 筛选器 */}
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">筛选：</span>

            {/* 状态筛选 */}
            <Select value={statusFilter || undefined} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="所有状态" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(JobStatusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 清除筛选 */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 px-3"
              >
                <X className="h-4 w-4 mr-1" />
                清除筛选
              </Button>
            )}

            {/* 筛选结果提示 */}
            {hasActiveFilters && (
              <span className="text-sm text-gray-500">
                筛选结果：{total} 条
              </span>
            )}
          </div>
        </div>

        {/* 职位列表 */}
        {loading ? (
          <TableSkeleton rows={5} columns={9} showHeader={true} />
        ) : (
          <>
            {/* 桌面端表格视图 */}
            <div className="hidden md:block bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>职位名称</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>经验等级</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>应聘人数</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <EmptyState
                        icon={Inbox}
                        title="暂无职位数据"
                        description="点击下方按钮创建第一个职位"
                        action={{ label: '新建职位', href: '/jobs/new' }}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{job.title}</p>
                        {job.location && (
                          <p className="text-sm text-gray-500">{job.location}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{job.department}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{JobTypeLabels[job.type]}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{ExperienceLevelLabels[job.experienceLevel]}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityMap[job.priority].color}>
                        {priorityMap[job.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusMap[job.status].color}>
                        {statusMap[job.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-600">{job._count.applications || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(job.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/jobs/${job.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                        </Link>

                        {job.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublish(job.id);
                            }}
                          >
                            发布
                          </Button>
                        )}

                        {job.status === 'PUBLISHED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClose(job.id);
                            }}
                          >
                            关闭
                          </Button>
                        )}

                        {(job.status === 'CLOSED' || job.status === 'DRAFT') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(job.id);
                            }}
                          >
                            归档
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(job);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>

          {/* 移动端卡片视图 */}
          <div className="md:hidden space-y-4">
            {jobs.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="暂无职位数据"
                description="点击下方按钮创建第一个职位"
                action={{ label: '新建职位', href: '/jobs/new' }}
              />
            ) : (
              jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/jobs/${job.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                        {job.location && (
                          <p className="text-sm text-gray-500">{job.location}</p>
                        )}
                      </div>
                      <Badge className={statusMap[job.status].color}>
                        {statusMap[job.status].label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">部门</p>
                        <p className="text-sm font-medium text-gray-900">{job.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">类型</p>
                        <p className="text-sm text-gray-600">{JobTypeLabels[job.type]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">经验等级</p>
                        <p className="text-sm text-gray-600">{ExperienceLevelLabels[job.experienceLevel]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">优先级</p>
                        <Badge className={priorityMap[job.priority].color} variant="secondary">
                          {priorityMap[job.priority].label}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="h-3 w-3" />
                        <span>{job._count.applications || 0} 人应聘</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/jobs/${job.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 分页 */}
          {total > pageSize && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-600">
                显示第 {(page - 1) * pageSize + 1} 到{' '}
                {Math.min(page * pageSize, total)} 条，共 {total} 条
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / pageSize)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
          </>
        )}

        {/* 删除确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除职位</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除职位 <span className="font-semibold">{jobToDelete?.title}</span> 吗？
                此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {deleting ? '删除中...' : '确认删除'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
