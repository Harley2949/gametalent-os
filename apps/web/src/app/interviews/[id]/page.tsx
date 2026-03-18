'use client';

import { Button, Badge, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, Label } from '@gametalent/ui';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  Phone,
  Star,
  FileText,
  CheckCircle2,
  XCircle,
  Edit,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { InterviewFeedbackForm } from '@/components/interview-feedback-form';
import { useToast } from '@/components/shared/Toast';
import { BackHeader } from '@/components/ui/BackHeader';
import { useAuth } from '@/contexts/auth-context';
import { fetchInterview, submitInterviewFeedback } from '@/lib/api';
import {
  Interview,
  InterviewStatusLabels,
  InterviewTypeLabels,
  InterviewStageLabels,
  InterviewFeedbackDto,
} from '@/types/interview';

export default function InterviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingData, setEditingData] = useState({
    score: 0,
    pros: '',
    cons: '',
    notes: '',
    tags: '',
  });

  // 权限检查：只有 ADMIN 和 HR 角色可以编辑
  const canEdit = user?.role === 'ADMIN' || user?.role === 'RECRUITER';

  useEffect(() => {
    loadInterview();
  }, [params.id]);

  const loadInterview = async () => {
    try {
      setLoading(true);
      const data = await fetchInterview(params.id);
      setInterview(data);
    } catch (error) {
      console.error('加载面试详情失败:', error);
      toast.error('加载面试详情失败');
      router.push('/interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (data: InterviewFeedbackDto) => {
    setSubmittingFeedback(true);
    try {
      await submitInterviewFeedback(params.id, data);
      toast.success('反馈提交成功');
      loadInterview();
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const response = await fetch(`http://localhost:3006/api/interviews/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        toast.success('状态更新成功');
        loadInterview();
      } else {
        toast.error('状态更新失败');
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('状态更新失败，请重试');
    }
  };

  // 开始编辑评价
  const handleEdit = () => {
    setEditingData({
      score: interview?.score || 0,
      pros: interview?.feedback?.pros || '',
      cons: interview?.feedback?.cons || '',
      notes: interview?.notes || '',
      tags: interview?.feedback?.tags?.join(', ') || '',
    });
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingData({
      score: 0,
      pros: '',
      cons: '',
      notes: '',
      tags: '',
    });
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE}/api/interviews/${params.id}/feedback`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          score: editingData.score,
          pros: editingData.pros,
          cons: editingData.cons,
          notes: editingData.notes,
          tags: editingData.tags.split(',').map(t => t.trim()).filter(t => t),
        }),
      });

      if (response.ok) {
        toast.success('评价更新成功');
        setIsEditing(false);
        loadInterview();
      } else {
        const error = await response.json();
        toast.error(error.message || '更新失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">加载中...</div>;
  }

  if (!interview) {
    return <div className="text-center py-8">面试不存在</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
      case 'NO_SHOW':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
      case 'ONSITE':
        return <Video className="h-4 w-4" />;
      case 'PHONE_SCREEN':
        return <Phone className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

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
          <Link href="/interviews" className="hover:text-gray-900 transition-colors">
            面试管理
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{interview.title}</span>
        </nav>

        {/* 头部信息 */}
        <div className="mb-6 space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{interview.title}</h1>
              <Badge variant="secondary">
                {InterviewStageLabels[interview.stage]}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{InterviewTypeLabels[interview.type]}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {getStatusIcon(interview.status)}
                {InterviewStatusLabels[interview.status]}
              </span>
            </div>
          </div>

          {interview.status === 'SCHEDULED' && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handleUpdateStatus('CANCELLED')}
              >
                取消面试
              </Button>
              <Button onClick={() => handleUpdateStatus('COMPLETED')}>
                标记完成
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Tab 内容 */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">面试信息</TabsTrigger>
              <TabsTrigger value="feedback">面试反馈</TabsTrigger>
              <TabsTrigger value="notes">备注</TabsTrigger>
            </TabsList>

            {/* 面试信息 */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interview.description && (
                    <div>
                      <h3 className="font-semibold mb-2">面试描述</h3>
                      <p className="text-muted-foreground">{interview.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">日期：</span>
                      <span className="font-medium">
                        {new Date(interview.scheduledAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">时间：</span>
                      <span className="font-medium">
                        {new Date(interview.scheduledAt).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">时长：</span>
                      <span className="font-medium">{interview.duration} 分钟</span>
                    </div>

                    {interview.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">地点：</span>
                        <span className="font-medium">{interview.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 面试反馈 */}
            <TabsContent value="feedback">
              {interview.status === 'SCHEDULED' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>提交面试反馈</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InterviewFeedbackForm
                      onSubmit={handleSubmitFeedback}
                      existingFeedback={interview.feedback}
                    />
                  </CardContent>
                </Card>
              ) : isEditing ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>编辑面试反馈</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={handleCancelEdit} disabled={saving}>
                          <X className="h-4 w-4 mr-1" />取消
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                          <Save className="h-4 w-4 mr-1" />{saving ? '保存中...' : '保存'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>评分</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditingData({ ...editingData, score: star })}
                            className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= editingData.score
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>优点</Label>
                      <Textarea
                        value={editingData.pros}
                        onChange={(e) => setEditingData({ ...editingData, pros: e.target.value })}
                        placeholder="请输入候选人的优点..."
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>缺点</Label>
                      <Textarea
                        value={editingData.cons}
                        onChange={(e) => setEditingData({ ...editingData, cons: e.target.value })}
                        placeholder="请输入候选人的不足之处..."
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>备注</Label>
                      <Textarea
                        value={editingData.notes}
                        onChange={(e) => setEditingData({ ...editingData, notes: e.target.value })}
                        placeholder="请输入其他备注信息..."
                        className="mt-2"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>评估标签</Label>
                      <input
                        type="text"
                        value={editingData.tags}
                        onChange={(e) => setEditingData({ ...editingData, tags: e.target.value })}
                        placeholder="请输入标签，用逗号分隔，如：技术扎实,沟通能力强"
                        className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>面试反馈</CardTitle>
                      {canEdit && (
                        <Button variant="secondary" size="sm" onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-1" />编辑
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {interview.score && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">评分：{interview.score}/5</span>
                      </div>
                    )}

                    {interview.feedback?.pros && (
                      <div>
                        <h3 className="font-semibold mb-2">优点</h3>
                        <p className="text-muted-foreground">{interview.feedback.pros}</p>
                      </div>
                    )}

                    {interview.feedback?.cons && (
                      <div>
                        <h3 className="font-semibold mb-2">缺点</h3>
                        <p className="text-muted-foreground">{interview.feedback.cons}</p>
                      </div>
                    )}

                    {interview.notes && (
                      <div>
                        <h3 className="font-semibold mb-2">备注</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {interview.notes}
                        </p>
                      </div>
                    )}

                    {interview.feedback?.tags && interview.feedback.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">评估标签</h3>
                        <div className="flex flex-wrap gap-2">
                          {interview.feedback.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 备注 */}
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>备注信息</CardTitle>
                </CardHeader>
                <CardContent>
                  {interview.notes ? (
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {interview.notes}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">暂无备注</p>
                  )}

                  {interview.nextSteps && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">后续步骤</h3>
                      <p className="text-muted-foreground">{interview.nextSteps}</p>
                    </div>
                  )}

                  {interview.followUpAt && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">跟进时间</h3>
                      <p className="text-muted-foreground">
                        {new Date(interview.followUpAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 右侧信息栏 */}
        <div className="space-y-6">
          {/* 候选人信息 */}
          {interview.application?.candidate && (
            <Card>
              <CardHeader>
                <CardTitle>候选人</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-lg font-semibold">
                    {interview.application.candidate.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {interview.application.candidate.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {interview.application.candidate.email}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/candidates/${interview.application.candidate.id}`}
                  className="block"
                >
                  <Button variant="ghost" size="sm" className="w-full">
                    查看候选人资料
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* 职位信息 */}
          {interview.application?.job && (
            <Card>
              <CardHeader>
                <CardTitle>应聘职位</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="font-semibold">
                      {interview.application.job.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {interview.application.job.department}
                    </div>
                  </div>
                  <Link href={`/jobs/${interview.application.job.id}`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      查看职位详情
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 面试官信息 */}
          {interview.interviewer && (
            <Card>
              <CardHeader>
                <CardTitle>面试官</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-semibold">
                    {interview.interviewer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{interview.interviewer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {interview.interviewer.email}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 面试属性 */}
          <Card>
            <CardHeader>
              <CardTitle>面试属性</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">类型</span>
                <div className="flex items-center gap-1">
                  {getTypeIcon(interview.type)}
                  <span className="text-sm font-medium">
                    {InterviewTypeLabels[interview.type]}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">阶段</span>
                <Badge variant="secondary">
                  {InterviewStageLabels[interview.stage]}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">状态</span>
                <Badge variant="secondary">
                  {InterviewStatusLabels[interview.status]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 时间信息 */}
          <Card>
            <CardHeader>
              <CardTitle>时间信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">创建时间</span>
                <span>
                  {new Date(interview.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">更新时间</span>
                <span>
                  {new Date(interview.updatedAt).toLocaleString('zh-CN')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
