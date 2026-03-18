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
import { Avatar, AvatarFallback, AvatarImage } from '@gametalent/ui';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gametalent/ui';
import { Plus, Search, Filter, X, Trash2, Eye, RefreshCw } from 'lucide-react';
import { fetchCandidates, deleteCandidate } from '@/lib/api';
import type { Candidate } from '@/types/candidate';

// Shared Components
import { TableSkeleton, EmptyState } from '@/components/shared';
import { BackHeader } from '@/components/ui/BackHeader';
import { useToast } from '@/components/shared/Toast';

const statusMap = {
  ACTIVE: { label: '活跃', color: 'bg-green-100 text-green-800' },
  INACTIVE: { label: '非活跃', color: 'bg-gray-100 text-gray-800' },
  HIRED: { label: '已录用', color: 'bg-blue-100 text-blue-800' },
  ARCHIVED: { label: '已归档', color: 'bg-yellow-100 text-yellow-800' },
};

const sourceMap = {
  LINKEDIN: 'LinkedIn',
  REFERRAL: '内推',
  DIRECT: '直投',
  AGENCY: '猎头',
  OTHER: '其他',
};

export default function CandidatesPage() {
  const router = useRouter();
  const toast = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 10;

  // 初始加载和依赖变化时刷新
  useEffect(() => {
    loadCandidates();
  }, [page, search, statusFilter, tagFilter]);

  // 自动刷新：页面重新可见时刷新数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !loading) {
        console.log('🔄 页面重新可见，刷新候选人列表');
        loadCandidates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading]);

  const loadCandidates = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetchCandidates({
        page,
        pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
        tags: tagFilter ? [tagFilter] : undefined,
      });
      setCandidates(response.data || []);
      setTotal(response.total || 0);

      // 收集所有标签
      const tags = new Set<string>();
      response.data?.forEach((candidate: Candidate) => {
        // 添加防御性检查，防止 tags 为 undefined/null 时崩溃
        candidate.tags?.forEach((tag) => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error('加载候选人失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadCandidates(true);
    // 刷新路由缓存，确保服务器端数据也是最新的
    router.refresh();
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleTagFilter = (value: string) => {
    setTagFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setTagFilter('');
    setPage(1);
  };

  const handleDeleteClick = (candidate: Candidate) => {
    setCandidateToDelete(candidate);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete) return;
    try {
      setDeleting(true);
      console.log('🗑️ 开始删除候选人:', candidateToDelete.name);

      await deleteCandidate(candidateToDelete.id);

      console.log('✅ 删除成功，刷新列表');
      toast.success(`✅ 已删除候选人：${candidateToDelete.name}`);

      // 刷新列表
      await loadCandidates();

      setDeleteDialogOpen(false);
      setCandidateToDelete(null);
    } catch (error) {
      console.error('❌ 删除候选人失败:', error);
      toast.error('❌ 删除失败，请稍后重试');
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = statusFilter || tagFilter;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <BackHeader />

        {/* 页头 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">候选人管理</h1>
            <p className="mt-2 text-sm text-gray-600">
              共 {total} 位候选人
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 刷新按钮 */}
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? '刷新中...' : '刷新'}
            </Button>
            <Link href="/candidates/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                新建候选人
              </Button>
            </Link>
          </div>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="mb-6 space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索候选人姓名、邮箱或公司..."
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
                <SelectItem value="ACTIVE">活跃</SelectItem>
                <SelectItem value="INACTIVE">非活跃</SelectItem>
                <SelectItem value="HIRED">已录用</SelectItem>
                <SelectItem value="ARCHIVED">已归档</SelectItem>
              </SelectContent>
            </Select>

            {/* 标签筛选 */}
            {allTags.length > 0 && (
              <Select value={tagFilter || undefined} onValueChange={handleTagFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="所有标签" />
                </SelectTrigger>
                <SelectContent>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* 清除筛选 */}
            {hasActiveFilters && (
              <Button
                variant="secondary"
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

        {/* 候选人列表 */}
        {loading ? (
          <TableSkeleton rows={5} columns={7} showHeader={true} />
        ) : (
          <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>候选人</TableHead>
                <TableHead>联系方式</TableHead>
                <TableHead>当前职位</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>标签</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState
                      icon={Search}
                      title="暂无候选人数据"
                      description="点击下方按钮创建第一个候选人"
                      action={{ label: '新建候选人', href: '/candidates/new' }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((candidate) => (
                  <TableRow key={candidate.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <Link href={`/candidates/${candidate.id}`} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={candidate.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(candidate.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{candidate.name}</p>
                          <p className="text-sm text-gray-500">{candidate.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {candidate.phoneNumber && (
                        <p className="text-sm text-gray-600">{candidate.phoneNumber}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {candidate.currentCompany && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {candidate.currentTitle || '职位未知'}
                          </p>
                          <p className="text-sm text-gray-500">{candidate.currentCompany}</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {sourceMap[candidate.source] || candidate.source}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusMap[candidate.status].color}>
                        {statusMap[candidate.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {candidate.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {candidate.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{candidate.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/candidates/${candidate.id}`}>
                          <Button variant="secondary" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteClick(candidate)}
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

          {/* 分页 */}
          {total > pageSize && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-600">
                显示第 {(page - 1) * pageSize + 1} 到{' '}
                {Math.min(page * pageSize, total)} 条，共 {total} 条
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page * pageSize >= total}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
          </div>
        )}

        {/* 删除确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除候选人</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除候选人 <span className="font-semibold">{candidateToDelete?.name}</span> 吗？
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
