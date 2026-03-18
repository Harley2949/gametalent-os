'use client';

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Inbox,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TableSkeleton, EmptyState } from '@/components/shared';
import { BackHeader } from '@/components/ui/BackHeader';
import { fetchInterviews, deleteInterview, createInterview, fetchCandidates } from '@/lib/api';
import {
  InterviewStatusLabels,
  InterviewTypeLabels,
  InterviewStageLabels
} from '@/types/interview';

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
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [candidatesError, setCandidatesError] = useState('');
  const [formData, setFormData] = useState({
    candidateId: '',
    applicationId: '',
    title: '',
    type: 'VIDEO',
    stage: 'TECHNICAL',
    scheduledAt: '',
    duration: 60,
    location: '',
    interviewerId: '',
    notes: '',
  });
  const pageSize = 10;

  useEffect(() => {
    loadInterviews();
  }, [page, statusFilter, stageFilter]);

  // 加载候选人列表（用于新建面试）
  useEffect(() => {
    const loadCandidates = async () => {
      setCandidatesLoading(true);
      setCandidatesError('');

      try {
        console.log('🔍 [加载候选人] 开始从后端获取...');
        const response = await fetchCandidates({ page: 1, pageSize: 100 });
        console.log(`✅ [加载候选人] 成功获取 ${response.data?.length || 0} 个候选人`);

        // 打印每个候选人的详细信息
        if (response.data && response.data.length > 0) {
          console.log('📋 [候选人列表] 详细信息:');
          response.data.forEach((c: any, index: number) => {
            console.log(`  ${index + 1}. ID: ${c.id}, 姓名: ${c.name}, 邮箱: ${c.email}`);
          });
        }

        setCandidates(response.data || []);

        if (response.data?.length === 0) {
          setCandidatesError('⚠️ 暂无候选人数据，请先在候选人管理页面添加候选人');
        }
      } catch (error) {
        console.error('❌ [加载候选人] 失败:', error);
        setCandidatesError('⚠️ 候选人列表加载失败，请刷新页面重试');
      } finally {
        setCandidatesLoading(false);
      }
    };
    loadCandidates();
  }, []);

  // 点击页面其他地方关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setShowStatusDropdown(false);
      setShowStageDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const handleCreateInterview = async () => {
    // 验证必填字段
    if (!formData.candidateId) {
      alert('请选择候选人');
      return;
    }

    // 验证候选人ID是否在有效列表中
    const selectedCandidate = candidates.find(c => c.id === formData.candidateId);
    if (!selectedCandidate) {
      alert(`所选候选人无效（ID: ${formData.candidateId}）。\n\n可能原因：\n1. 候选人数据已更新\n2. 页面缓存问题\n\n建议：刷新页面后重试`);
      return;
    }

    if (!formData.title) {
      alert('请输入面试标题');
      return;
    }
    if (!formData.scheduledAt) {
      alert('请选择面试时间');
      return;
    }

    try {
      setCreating(true);

      console.log('📤 [创建面试] 发送请求:', {
        candidateId: formData.candidateId,
        candidateName: selectedCandidate.name,
        title: formData.title,
        type: formData.type,
        stage: formData.stage,
        scheduledAt: formData.scheduledAt,
        duration: formData.duration,
      });

      const result = await createInterview({
        candidateId: formData.candidateId,
        applicationId: formData.applicationId || undefined,
        title: formData.title,
        type: formData.type,
        stage: formData.stage,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        duration: formData.duration,
        location: formData.location,
        interviewerId: formData.interviewerId,
        notes: formData.notes,
      });

      console.log('✅ [创建面试] 成功:', result);

      // 成功后刷新列表并关闭对话框
      await loadInterviews();
      setCreateDialogOpen(false);

      // 显示成功消息
      alert(`✅ 面试创建成功！\n\n候选人：${selectedCandidate.name}\n面试：${formData.title}\n时间：${new Date(formData.scheduledAt).toLocaleString('zh-CN')}`);

      // 重置表单
      setFormData({
        candidateId: '',
        applicationId: '',
        title: '',
        type: 'VIDEO',
        stage: 'TECHNICAL',
        scheduledAt: '',
        duration: 60,
        location: '',
        interviewerId: '',
        notes: '',
      });
    } catch (error: any) {
      console.error('❌ [创建面试] 失败:', error);

      // 尝试提取详细错误信息
      let errorMessage = '创建面试失败，请重试';

      if (error.response) {
        // 后端返回了错误响应
        const data = await error.response.json().catch(() => null);
        if (data && data.message) {
          errorMessage = data.message;
        } else if (data && data.error) {
          errorMessage = data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // 显示详细错误
      alert(`❌ 创建面试失败\n\n原因：${errorMessage}\n\n💡 建议：\n1. 检查候选人是否有应聘记录\n2. 确认面试时间格式正确\n3. 刷新页面后重试`);
    } finally {
      setCreating(false);
    }
  };

  const hasActiveFilters = statusFilter !== 'all' || stageFilter !== 'all';

  const clearFilters = () => {
    setStatusFilter('all');
    setStageFilter('all');
    setPage(1);
  };

  const currentStatusLabel = statusFilter === 'all' ? '所有状态' : InterviewStatusLabels[statusFilter as keyof typeof InterviewStatusLabels];
  const currentStageLabel = stageFilter === 'all' ? '所有阶段' : InterviewStageLabels[stageFilter as keyof typeof InterviewStageLabels];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackHeader fallbackHref="/dashboard" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">面试管理</h1>
            <p className="mt-2 text-sm text-gray-600">
              共 {total} 场面试
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                新建面试
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新建面试</DialogTitle>
                <DialogDescription>
                  为候选人安排一场新的面试
                </DialogDescription>
              </DialogHeader>

              {/* 数据来源提示 */}
              {candidates.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 text-sm">💡</span>
                    <div className="text-xs text-blue-800">
                      <p className="font-medium">候选人数据来源说明：</p>
                      <p className="mt-1">
                        {candidates[0]?.id?.startsWith('mock-')
                          ? '⚠️ 当前显示Mock数据。创建面试将使用Mock模式，数据不会保存到数据库。'
                          : '✅ 从后端数据库加载的真实候选人。创建的面试将保存到数据库。'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 py-4">
                {/* 候选人选择 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">候选人 <span className="text-red-500">*</span></label>
                    <span className="text-xs text-gray-500">
                      {candidates.length > 0 ? `共 ${candidates.length} 位候选人` : '加载中...'}
                    </span>
                  </div>

                  {candidatesError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      ⚠️ {candidatesError}
                    </div>
                  )}

                  {candidatesLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-center">
                      正在加载候选人列表...
                    </div>
                  ) : candidates.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-center">
                      暂无可用候选人
                    </div>
                  ) : (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.candidateId}
                      onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                    >
                      <option value="">请选择候选人</option>
                      {candidates.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name} - {candidate.currentTitle || candidate.currentCompany || '未知职位'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 面试标题 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">面试标题 <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="例如：技术面试 - 第一轮"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* 面试类型和阶段 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">面试类型</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="VIDEO">视频面试</option>
                      <option value="ONSITE">现场面试</option>
                      <option value="PHONE">电话面试</option>
                      <option value="OTHER">其他</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">面试阶段</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    >
                      <option value="TECHNICAL">技术面试</option>
                      <option value="HR">HR面试</option>
                      <option value="CULTURAL">文化面试</option>
                      <option value="EXECUTIVE">高管面试</option>
                      <option value="OTHER">其他</option>
                    </select>
                  </div>
                </div>

                {/* 面试时间 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">面试时间 <span className="text-red-500">*</span></label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  />
                </div>

                {/* 面试时长和地点 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">面试时长（分钟）</label>
                    <Input
                      type="number"
                      min="15"
                      max="240"
                      step="15"
                      value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">面试地点/链接</label>
                    <Input
                      placeholder="会议室名称或视频会议链接"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* 备注 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">备注</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder="面试注意事项、重点考察内容等..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={creating}
                >
                  取消
                </Button>
                <Button
                  onClick={handleCreateInterview}
                  disabled={creating}
                >
                  {creating ? '创建中...' : '创建面试'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">筛选：</span>

            {/* 状态筛选 - 自定义按钮 */}
            <div className="relative" style={{ zIndex: 20 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowStageDropdown(false);
                }}
                className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center justify-between hover:bg-accent hover:text-accent-foreground"
              >
                <span>{currentStatusLabel}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showStatusDropdown && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-1 w-[180px] rounded-md border bg-background shadow-lg z-50 max-h-60 overflow-auto"
                >
                  <div
                    onClick={() => { setStatusFilter('all'); setShowStatusDropdown(false); setPage(1); }}
                    className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                  >
                    所有状态
                  </div>
                  {Object.entries(InterviewStatusLabels).map(([key, label]) => (
                    <div
                      key={key}
                      onClick={() => { setStatusFilter(key); setShowStatusDropdown(false); setPage(1); }}
                      className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 阶段筛选 - 自定义按钮 */}
            <div className="relative" style={{ zIndex: 20 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStageDropdown(!showStageDropdown);
                  setShowStatusDropdown(false);
                }}
                className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center justify-between hover:bg-accent hover:text-accent-foreground"
              >
                <span>{currentStageLabel}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showStageDropdown && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-1 w-[180px] rounded-md border bg-background shadow-lg z-50 max-h-60 overflow-auto"
                >
                  <div
                    onClick={() => { setStageFilter('all'); setShowStageDropdown(false); setPage(1); }}
                    className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                  >
                    所有阶段
                  </div>
                  {Object.entries(InterviewStageLabels).map(([key, label]) => (
                    <div
                      key={key}
                      onClick={() => { setStageFilter(key); setShowStageDropdown(false); setPage(1); }}
                      className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

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
