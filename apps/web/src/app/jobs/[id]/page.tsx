'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/shared/Toast';
import { BackHeader } from '@/components/ui/BackHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gametalent/ui';
import { Button } from '@gametalent/ui';
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
  Edit,
  Users,
  DollarSign,
  MapPin,
  Building2,
  Briefcase,
  Target,
  Loader2,
  CheckCircle2,
  XCircle,
  Archive,
  Send,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import {
  fetchJob,
  deleteJob,
  publishJob,
  closeJob,
  archiveJob,
  fetchApplications,
} from '@/lib/api';
import {
  Job,
  JobTypeLabels,
  WorkModeLabels,
  ExperienceLevelLabels,
} from '@/types/job';
import { JobMatchPanel } from '@/components/jobs/job-match-panel';

const statusMap = {
  DRAFT: { label: '草稿', color: 'bg-gray-100 text-gray-800' },
  PUBLISHED: { label: '已发布', color: 'bg-green-100 text-green-800' },
  CLOSED: { label: '已关闭', color: 'bg-red-100 text-red-800' },
  ARCHIVED: { label: '已归档', color: 'bg-yellow-100 text-yellow-800' },
};

const priorityMap = {
  URGENT: { label: '紧急', color: 'bg-red-100 text-red-800' },
  HIGH: { label: '高', color: 'bg-orange-100 text-orange-800' },
  MEDIUM: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
  LOW: { label: '低', color: 'bg-gray-100 text-gray-800' },
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await fetchJob(jobId);
      setJob(data);
    } catch (error) {
      console.error('加载职位详情失败:', error);
      toast.error('加载职位详情失败');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setLoadingApplications(true);
      const result = await fetchApplications({
        jobId,
        page: 1,
        pageSize: 10,
      });
      setApplications(result.data);
    } catch (error) {
      console.error('加载应聘记录失败:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => {
    loadJob();
    loadApplications();
  }, [jobId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteJob(jobId);
      toast.success('职位删除成功');
      router.push('/jobs');
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败，请重试');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handlePublish = async () => {
    try {
      await publishJob(jobId);
      toast.success('职位发布成功');
      loadJob();
    } catch (error) {
      console.error('发布失败:', error);
      toast.error('发布失败，请重试');
    }
  };

  const handleClose = async () => {
    const reason = prompt('请输入关闭原因（可选）');
    try {
      await closeJob(jobId, reason || undefined);
      toast.success('职位已关闭');
      loadJob();
    } catch (error) {
      console.error('关闭失败:', error);
      toast.error('关闭失败，请重试');
    }
  };

  const handleArchive = async () => {
    try {
      await archiveJob(jobId);
      toast.success('职位已归档');
      loadJob();
    } catch (error) {
      console.error('归档失败:', error);
      toast.error('归档失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">职位不存在</p>
          <Link href="/jobs">
            <Button variant="ghost">返回列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <BackHeader />

        {/* 面包屑导航 */}
        <nav className="flex items-center gap-2 text-sm mb-6 text-gray-600">
          <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
            控制台
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/jobs" className="hover:text-gray-900 transition-colors">
            职位管理
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{job.title}</span>
        </nav>

        {/* 头部信息卡片 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  <Badge className={statusMap[job.status].color}>
                    {statusMap[job.status].label}
                  </Badge>
                  <Badge className={priorityMap[job.priority].color}>
                    {priorityMap[job.priority].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-lg text-gray-700">
                    {job.department} {job.team && `· ${job.team}`}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{JobTypeLabels[job.type]}</span>
                    <span>•</span>
                    <span>{WorkModeLabels[job.workMode]}</span>
                    <span>•</span>
                    <span>
                      创建时间：{new Date(job.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {job.status === 'DRAFT' && (
                  <Button onClick={handlePublish}>
                    <Send className="mr-2 h-4 w-4" />
                    发布职位
                  </Button>
                )}
                {job.status === 'PUBLISHED' && (
                  <Button variant="ghost" onClick={handleClose}>
                    <XCircle className="mr-2 h-4 w-4" />
                    关闭职位
                  </Button>
                )}
                {(job.status === 'CLOSED' || job.status === 'DRAFT') && (
                  <Button variant="ghost" onClick={handleArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    归档
                  </Button>
                )}
                <Link href={`/jobs/${job.id}/edit`}>
                  <Button variant="ghost">
                    <Edit className="mr-2 h-4 w-4" />
                    编辑
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 职位详情 */}
            <Card>
              <CardHeader>
                <CardTitle>职位详情</CardTitle>
                <CardDescription>职位描述、要求和职责</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">职位描述</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {job.description || '暂无描述'}
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">任职要求</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {job.requirements || '暂无要求'}
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">工作职责</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {job.responsibilities || '暂无职责说明'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 应聘候选人列表 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      应聘候选人
                    </CardTitle>
                    <CardDescription>该职位的所有应聘记录</CardDescription>
                  </div>
                  <Link href={`/applications?jobId=${job.id}`}>
                    <Button variant="secondary" size="sm">
                      查看全部
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingApplications ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无应聘记录</p>
                    <p className="text-sm mt-2">发布职位后将显示应聘候选人</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <Link
                        key={app.id}
                        href={`/applications/${app.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                              {app.candidate?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {app.candidate?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {app.candidate?.currentCompany || '未知公司'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {app.matchScore && (
                              <Badge variant="secondary" className="text-green-600">
                                匹配度 {app.matchScore}%
                              </Badge>
                            )}
                            <Badge className={
                              app.status === 'APPLIED' ? 'bg-blue-100 text-blue-800' :
                              app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧附加信息 */}
          <div className="space-y-6">
            {/* 统计概览 */}
            <Card>
              <CardHeader>
                <CardTitle>统计概览</CardTitle>
                <CardDescription>职位数据统计</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">应聘人数</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {job.applicantCount || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">面试人数</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {job.interviewCount}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">Offer 数量</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {job.offerCount}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 职位属性 */}
            <Card>
              <CardHeader>
                <CardTitle>职位属性</CardTitle>
                <CardDescription>基本信息和待遇</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    职位类型
                  </div>
                  <p className="text-gray-900 font-medium">
                    {JobTypeLabels[job.type]}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    工作模式
                  </div>
                  <p className="text-gray-900 font-medium">
                    {WorkModeLabels[job.workMode]}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    经验等级
                  </div>
                  <p className="text-gray-900 font-medium">
                    {ExperienceLevelLabels[job.experienceLevel]}
                  </p>
                </div>

                {job.location && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      工作地点
                    </div>
                    <p className="text-gray-900 font-medium">{job.location}</p>
                  </div>
                )}

                {(job.salaryMin || job.salaryMax) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      薪资范围
                    </div>
                    <p className="text-gray-900 font-medium">
                      {job.salaryMin && job.salaryMax
                        ? `${job.salaryMin} - ${job.salaryMax}`
                        : job.salaryMin || job.salaryMax}
                      {' '}{job.salaryCurrency}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 目标候选人 */}
            {(job.targetCompanies.length > 0 || job.targetSkills.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    目标候选人
                  </CardTitle>
                  <CardDescription>期望的公司和技能背景</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.targetCompanies.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                        目标公司
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.targetCompanies.map((company, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.targetSkills.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                        目标技能
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.targetSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 负责人 */}
            <Card>
              <CardHeader>
                <CardTitle>负责人</CardTitle>
                <CardDescription>创建者和协作人员</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    创建人
                  </p>
                  <p className="text-gray-900 font-medium">{job.creator.name}</p>
                  <p className="text-sm text-gray-500">{job.creator.email}</p>
                </div>

                {job.assignees.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                      分配给
                    </p>
                    <div className="space-y-3">
                      {job.assignees.map((assignee) => (
                        <div key={assignee.id}>
                          <p className="text-gray-900 font-medium">{assignee.name}</p>
                          <p className="text-sm text-gray-500">{assignee.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI 匹配分析 */}
            <JobMatchPanel
              jobId={job.id}
              onUpdate={loadApplications}
            />
          </div>
        </div>

        {/* 删除确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除职位</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除职位 <span className="font-semibold">{job?.title}</span> 吗？
                此操作无法撤销，所有相关的应聘记录也将被删除。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
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
