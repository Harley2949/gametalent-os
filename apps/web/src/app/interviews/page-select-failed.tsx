'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import { Input } from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
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
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Video,
  Eye,
  Trash2,
  Filter,
  X,
  Inbox
} from 'lucide-react';
import { fetchInterviews, deleteInterview } from '@/lib/api';
import {
  InterviewStatusLabels,
  InterviewTypeLabels,
  InterviewStageLabels
} from '@/types/interview';
import { BackHeader } from '@/components/ui/BackHeader';
import { TableSkeleton, EmptyState } from '@/components/shared';

const statusMap = {
  SCHEDULED: { label: '已安排', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
  NO_SHOW: { label: '未出席', color: 'bg-red-100 text-red-800' },
};

export default function InterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    loadInterviews();
  }, [page, statusFilter, stageFilter]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetchInterviews({
        page,
        pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        stage: stageFilter !== 'all' ? stageFilter : undefined,
      });
      setInterviews(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('加载面试列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (interview: any) => {
    setInterviewToDelete(interview);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!interviewToDelete) return;
    try {
      setDeleting(true);
      await deleteInterview(interviewToDelete.id);
      await loadInterviews();
      setDeleteDialogOpen(false);
      setInterviewToDelete(null);
    } catch (error) {
      console.error('删除面试失败:', error);
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = statusFilter !== 'all' || stageFilter !== 'all';

  const clearFilters = () => {
    console.log('🧹 [清除筛选] 清除所有筛选条件');
    setStatusFilter('all');
    setStageFilter('all');
    setPage(1);
  };

  // 调试：确认组件渲染
  console.log('✅ [组件渲染] InterviewsPage 渲染完成', {
    statusFilter,
    stageFilter,
    hasActiveFilters,
    interviewsCount: interviews.length,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackHeader />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">面试管理</h1>
            <p className="mt-2 text-sm text-gray-600">
              共 {total} 场面试
            </p>
          </div>
          <Link href="/applications">
            <Button className="flex items-center gap-2" variant="ghost">
              <Plus className="h-4 w-4" />
              前往应聘管理
            </Button>
          </Link>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索面试标题、候选人姓名..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap" style={{ position: 'relative', zIndex: 10 }}>
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">筛选：</span>

            {/* 状态筛选 - 原生HTML select */}
            <select
              value={statusFilter}
              onChange={(e) => {
                console.log('🔄 [状态筛选] 原值:', statusFilter, '→ 新值:', e.target.value);
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{ position: 'relative', zIndex: 100, cursor: 'pointer' }}
            >
              <option value="all">所有状态</option>
              {Object.entries(InterviewStatusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* 阶段筛选 - 原生HTML select */}
            <select
              value={stageFilter}
              onChange={(e) => {
                console.log('🔄 [阶段筛选] 原值:', stageFilter, '→ 新值:', e.target.value);
                setStageFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{ position: 'relative', zIndex: 100, cursor: 'pointer' }}
            >
              <option value="all">所有阶段</option>
              {Object.entries(InterviewStageLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-3">
                <X className="h-4 w-4 mr-1" />
                清除筛选
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={8} showHeader={true} />
        ) : (
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>面试标题</TableHead>
                  <TableHead>候选人</TableHead>
                  <TableHead>职位</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>阶段</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <EmptyState
                        icon={Inbox}
                        title={hasActiveFilters ? "暂无符合条件的面试记录" : "暂无面试数据"}
                        description={hasActiveFilters ? "请尝试调整筛选条件" : "请前往应聘管理页面选择应聘并安排面试"}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  interviews.map((interview) => (
                    <TableRow
                      key={interview.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/interviews/${interview.id}`)}
                    >
                      <TableCell>
                        <p className="font-medium text-gray-900">{interview.title}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs">
                            {interview.application?.candidate?.name?.charAt(0) || '?'}
                          </div>
                          <span className="text-sm text-gray-900">
                            {interview.application?.candidate?.name || '未知'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {interview.application?.job?.title || '未知职位'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {InterviewTypeLabels[interview.type as keyof typeof InterviewTypeLabels]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {InterviewStageLabels[interview.stage as keyof typeof InterviewStageLabels]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {new Date(interview.scheduledAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {new Date(interview.scheduledAt).toLocaleTimeString('zh-CN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusMap[interview.status as keyof typeof statusMap]?.color}>
                          {statusMap[interview.status as keyof typeof statusMap]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/interviews/${interview.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              查看
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(interview);
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
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除面试</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除面试 <span className="font-semibold">{interviewToDelete?.title}</span> 吗？
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
