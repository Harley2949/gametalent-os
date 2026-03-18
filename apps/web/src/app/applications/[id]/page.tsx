'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { Label } from '@gametalent/ui';
import { Textarea } from '@gametalent/ui';
import { Input } from '@gametalent/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gametalent/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@gametalent/ui';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  Star,
  Plus,
  ChevronRight,
  Tag,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { useToast } from '@/components/shared/Toast';
import { BackHeader } from '@/components/ui/BackHeader';
import {
  fetchApplication,
  updateApplicationStatus,
  screenApplication,
  createInterview,
  fetchUsers,
} from '@/lib/api';
import {
  Application,
  ApplicationStatus,
  ApplicationStatusLabels,
  ApplicationStatusColors,
  ApplicationStatusFlow,
} from '@/types/application';
import { User as UserType } from '@/types/auth';
import {
  InterviewType,
  InterviewTypeLabels,
  InterviewStage,
  InterviewStageLabels,
} from '@/types/interview';

// 🎨 Mock 数据 - 与列表页保持一致
const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app_001',
    candidateId: 'candidate_001',
    jobId: 'job_001',
    status: 'INTERVIEWING' as ApplicationStatus,
    transparencyLevel: 'STANDARD',
    appliedAt: '2026-03-12T10:30:00Z',
    createdAt: '2026-03-12T10:30:00Z',
    updatedAt: '2026-03-12T10:30:00Z',
    screeningScore: 85,
    matchScore: 92,
    candidate: {
      id: 'candidate_001',
      name: '魏允瀚',
      email: 'wei.yunhan@example.com',
      phoneNumber: '+86 138 0013 8888',
      status: 'ACTIVE',
      currentCompany: '腾讯游戏',
      currentTitle: 'Unity 高级开发工程师',
      location: '深圳',
      yearsOfExperience: 5,
      tags: ['硕士', 'QS200', '海外教育背景', '5年经验'],
    },
    job: {
      id: 'job_001',
      title: 'Unity 高级开发工程师',
      department: '技术部',
      location: '深圳',
      status: 'PUBLISHED',
    },
  },
  {
    id: 'app_002',
    candidateId: 'candidate_002',
    jobId: 'job_001',
    status: 'APPLIED' as ApplicationStatus,
    appliedAt: '2026-03-10T14:20:00Z',
    createdAt: '2026-03-10T14:20:00Z',
    updatedAt: '2026-03-10T14:20:00Z',
    transparencyLevel: 'STANDARD',
    screeningScore: 78,
    matchScore: 88,
    candidate: {
      id: 'candidate_002',
      name: '李思琪',
      email: 'li.siqi@example.com',
      phoneNumber: '+86 139 1234 5678',
      currentCompany: '网易游戏',
      currentTitle: '游戏策划',
      location: '广州',
      status: 'PUBLISHED',
      educationLevel: 'BACHELOR',
      school: '中山大学',
      major: '数字媒体艺术',
      graduationYear: 2021,
      yearsOfExperience: 3,
    },
    job: {
      id: 'job_001',
      title: 'Unity 高级开发工程师',
      department: '技术部',
      location: '深圳',
      status: 'PUBLISHED',
    },
  },
  {
    id: 'app_003',
    candidateId: 'candidate_003',
    jobId: 'job_001',
    status: 'SCREENING' as ApplicationStatus,
    appliedAt: '2026-03-11T09:15:00Z',
    createdAt: '2026-03-11T09:15:00Z',
    updatedAt: '2026-03-11T09:15:00Z',
    transparencyLevel: 'STANDARD',
    screeningScore: 82,
    matchScore: 75,
    candidate: {
      id: 'candidate_003',
      name: '张子轩',
      email: 'zhang.zixuan@example.com',
      phoneNumber: '+86 137 9876 5432',
      status: 'ACTIVE',
      currentCompany: '米哈游',
      currentTitle: 'Unity 中级开发工程师',
      location: '上海',
      educationLevel: 'MASTER',
      school: '上海交通大学',
      major: '软件工程',
      graduationYear: 2020,
      yearsOfExperience: 4,
    },
    job: {
      id: 'job_001',
      title: 'Unity 高级开发工程师',
      department: '技术部',
      location: '深圳',
      status: 'PUBLISHED',
    },
  },
  {
    id: 'app_004',
    candidateId: 'candidate_004',
    jobId: 'job_002',
    status: 'SHORTLISTED' as ApplicationStatus,
    appliedAt: '2026-03-09T16:45:00Z',
    createdAt: '2026-03-09T16:45:00Z',
    updatedAt: '2026-03-09T16:45:00Z',
    transparencyLevel: 'STANDARD',
    screeningScore: 90,
    matchScore: 95,
    candidate: {
      id: 'candidate_004',
      name: '王诗涵',
      email: 'wang.shihan@example.com',
      phoneNumber: '+86 136 5432 1098',
      status: 'ACTIVE',
      currentCompany: '莉莉丝游戏',
      currentTitle: '技术美术（TA）',
      location: '北京',
      educationLevel: 'MASTER',
      school: '中国传媒大学',
      major: '数字媒体技术',
      graduationYear: 2019,
      yearsOfExperience: 6,
    },
    job: {
      id: 'job_002',
      title: '技术美术（TA）',
      department: '技术部',
      location: '上海',
      status: 'PUBLISHED',
    },
  },
  {
    id: 'app_005',
    candidateId: 'candidate_005',
    jobId: 'job_003',
    status: 'REVIEWED' as ApplicationStatus,
    appliedAt: '2026-03-09T11:30:00Z',
    createdAt: '2026-03-09T11:30:00Z',
    updatedAt: '2026-03-09T11:30:00Z',
    transparencyLevel: 'STANDARD',
    screeningScore: 88,
    matchScore: 91,
    candidate: {
      id: 'candidate_005',
      name: '刘强',
      email: 'liu.qiang@example.com',
      phoneNumber: '+86 135 5555 3333',
      status: 'ACTIVE',
      currentCompany: '莉莉丝游戏',
      currentTitle: '服务器开发工程师',
      location: '上海',
      educationLevel: 'MASTER',
      school: '浙江大学',
      major: '计算机科学',
      graduationYear: 2017,
      yearsOfExperience: 8,
    },
    job: {
      id: 'job_003',
      title: '游戏服务器开发工程师',
      department: '技术部',
      location: '上海',
      status: 'PUBLISHED',
    },
  },
];

// 🎨 Mock 面试官数据
const MOCK_INTERVIEWERS: UserType[] = [
  {
    id: 'user_001',
    name: '张技术',
    email: 'zhang.technical@gametalent.com',
    role: 'INTERVIEWER',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_002',
    name: '李HR',
    email: 'li.hr@gametalent.com',
    role: 'INTERVIEWER',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_003',
    name: '王经理',
    email: 'wang.manager@gametalent.com',
    role: 'INTERVIEWER',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_004',
    name: '赵CTO',
    email: 'zhao.cto@gametalent.com',
    role: 'INTERVIEWER',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const sourceMap: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  REFERRAL: '内推',
  DIRECT: '直投',
  CAREER_PAGE: '官网投递',
  AGENCY: '猎头',
  HEADHUNT: '猎头',
  UPLOAD: '上传',
  OTHER: '其他',
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [screening, setScreening] = useState(false);

  // 筛选表单
  const [screeningForm, setScreeningForm] = useState({
    screeningScore: '',
    screeningNotes: '',
    passed: undefined as boolean | undefined,
  });

  // 面试安排
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingInterview, setSchedulingInterview] = useState(false);
  const [interviewers, setInterviewers] = useState<UserType[]>([]);
  const [interviewForm, setInterviewForm] = useState({
    title: '',
    interviewerId: '',
    type: 'VIDEO' as InterviewType,
    stage: 'SCREENING' as InterviewStage,
    scheduledAt: '',
    duration: 60,
    location: '',
    description: '',
  });

  const loadApplication = async () => {
    try {
      // 🎯 从Mock数据中查找应聘记录
      const data = MOCK_APPLICATIONS.find(app => app.id === applicationId);

      if (!data) {
        throw new Error(`未找到ID为 ${applicationId} 的应聘记录`);
      }

      setApplication(data);
      if (data.screeningScore) {
        setScreeningForm({
          screeningScore: String(data.screeningScore),
          screeningNotes: data.screeningNotes || '',
          passed: undefined,
        });
      }
    } catch (error) {
      console.error('加载应聘详情失败:', error);
      toast.error('加载应聘详情失败');
      router.push('/applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  useEffect(() => {
    const loadInterviewers = async () => {
      try {
        // 🎯 从Mock数据中加载面试官列表
        setInterviewers(MOCK_INTERVIEWERS);
      } catch (error) {
        console.error('加载面试官列表失败:', error);
        setInterviewers([]);
      }
    };
    loadInterviewers();
  }, []);

  const handleStatusUpdate = async (newStatus: ApplicationStatus) => {
    if (!application) return;

    setUpdatingStatus(true);
    try {
      // 🎯 Mock：模拟状态更新成功
      console.log('更新应聘状态:', applicationId, newStatus);

      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success(`状态已更新为：${ApplicationStatusLabels[newStatus]}（Mock）`);
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败，请重试');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleScreen = async () => {
    if (!application) return;

    setScreening(true);
    try {
      await screenApplication(applicationId, {
        screeningScore: screeningForm.screeningScore ? parseInt(screeningForm.screeningScore) : undefined,
        screeningNotes: screeningForm.screeningNotes || undefined,
        passed: screeningForm.passed,
      });
      await loadApplication();
      toast.success('筛选完成');
    } catch (error) {
      console.error('筛选失败:', error);
      toast.error('筛选失败，请重试');
    } finally {
      setScreening(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!application) return;

    if (!interviewForm.title || !interviewForm.interviewerId || !interviewForm.scheduledAt) {
      toast.warning('请填写必填字段');
      return;
    }

    setSchedulingInterview(true);
    try {
      // 🎯 Mock：模拟面试安排成功
      console.log('安排面试:', {
        applicationId,
        ...interviewForm,
      });

      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowScheduleModal(false);
      setInterviewForm({
        title: '',
        interviewerId: '',
        type: 'VIDEO',
        stage: 'SCREENING',
        scheduledAt: '',
        duration: 60,
        location: '',
        description: '',
      });
      toast.success('面试安排成功（Mock）');
    } catch (error) {
      console.error('安排面试失败:', error);
      toast.error('安排面试失败，请重试');
    } finally {
      setSchedulingInterview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">应聘记录不存在</p>
          <Link href="/applications">
            <Button variant="ghost">返回列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  const candidate = application.candidate;
  const job = application.job;

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
          <Link href="/applications" className="hover:text-gray-900 transition-colors">
            应聘管理
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{candidate?.name} - {job?.title}</span>
        </nav>

        {/* 头部信息卡片 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{candidate?.name}</h1>
                  <Badge className={ApplicationStatusColors[application.status]}>
                    {ApplicationStatusLabels[application.status]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-lg text-gray-700">
                    应聘职位：{job?.title}
                    {job?.department && ` · ${job.department}`}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{application.source ? (sourceMap[application.source] || application.source) : '未知来源'}</span>
                    <span>•</span>
                    <span>
                      申请时间：{new Date(application.appliedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {application.status !== 'BLACKLISTED' && application.status !== 'HIRED' && (
                  <Select
                    value={application.status}
                    onValueChange={(value) => handleStatusUpdate(value as ApplicationStatus)}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="更新状态" />
                    </SelectTrigger>
                    <SelectContent>
                      {ApplicationStatusFlow.map((status) => (
                        <SelectItem key={status} value={status}>
                          {ApplicationStatusLabels[status]}
                        </SelectItem>
                      ))}
                      <SelectItem value="BLACKLISTED">拉黑</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      安排面试
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>安排面试</DialogTitle>
                      <DialogDescription>
                        为 {candidate?.name} 安排面试，系统将自动发送邀请邮件。
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="interview-title">
                          面试标题 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="interview-title"
                          value={interviewForm.title}
                          onChange={(e) => setInterviewForm({ ...interviewForm, title: e.target.value })}
                          placeholder="例如：技术面试 - 游戏客户端开发"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="interviewer">
                          面试官 <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={interviewForm.interviewerId}
                          onValueChange={(value) => setInterviewForm({ ...interviewForm, interviewerId: value })}
                        >
                          <SelectTrigger id="interviewer">
                            <SelectValue placeholder="选择面试官" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(interviewers) && interviewers.length > 0 ? (
                              interviewers.map((interviewer) => (
                                <SelectItem key={interviewer.id} value={interviewer.id}>
                                  {interviewer.name} - {interviewer.title || interviewer.role || '面试官'}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                暂无可用面试官
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="interview-type">面试类型</Label>
                          <Select
                            value={interviewForm.type}
                            onValueChange={(value) => setInterviewForm({ ...interviewForm, type: value as InterviewType })}
                          >
                            <SelectTrigger id="interview-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(InterviewTypeLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="interview-stage">面试阶段</Label>
                          <Select
                            value={interviewForm.stage}
                            onValueChange={(value) => setInterviewForm({ ...interviewForm, stage: value as InterviewStage })}
                          >
                            <SelectTrigger id="interview-stage">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(InterviewStageLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="scheduled-at">
                            面试时间 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="scheduled-at"
                            type="datetime-local"
                            value={interviewForm.scheduledAt}
                            onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="duration">时长（分钟）</Label>
                          <Input
                            id="duration"
                            type="number"
                            min="15"
                            max="480"
                            value={interviewForm.duration}
                            onChange={(e) => setInterviewForm({ ...interviewForm, duration: parseInt(e.target.value) || 60 })}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="location">面试地点/会议链接</Label>
                        <Input
                          id="location"
                          value={interviewForm.location}
                          onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })}
                          placeholder="例如：会议室 A 或 Zoom 链接"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">面试描述</Label>
                        <Textarea
                          id="description"
                          value={interviewForm.description}
                          onChange={(e) => setInterviewForm({ ...interviewForm, description: e.target.value })}
                          placeholder="面试的主要内容、注意事项等..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>
                        取消
                      </Button>
                      <Button onClick={handleScheduleInterview} disabled={schedulingInterview}>
                        {schedulingInterview ? '安排中...' : '确认安排'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 候选人信息 */}
            <Card>
              <CardHeader>
                <CardTitle>候选人信息</CardTitle>
                <CardDescription>应聘者的基本资料和背景</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">姓名</p>
                    <p className="text-gray-900 font-medium">{candidate?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">状态</p>
                    <div>
                      <Badge variant="secondary">{candidate?.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">邮箱</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${candidate?.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {candidate?.email}
                      </a>
                    </div>
                  </div>
                  {candidate?.phoneNumber && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">电话</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a
                          href={`tel:${candidate.phoneNumber}`}
                          className="text-blue-600 hover:underline"
                        >
                          {candidate.phoneNumber}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {candidate?.location && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      所在地
                    </p>
                    <p className="text-gray-900">{candidate.location}</p>
                  </div>
                )}

                {candidate?.currentCompany && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      当前公司
                    </p>
                    <p className="text-gray-900">
                      {candidate.currentCompany}
                      {candidate.currentTitle && ` · ${candidate.currentTitle}`}
                    </p>
                  </div>
                )}

                {candidate?.yearsOfExperience && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">工作年限</p>
                    <p className="text-gray-900 font-medium">{candidate.yearsOfExperience} 年</p>
                  </div>
                )}

                {candidate?.tags && candidate.tags.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      标签
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Link href={`/candidates/${candidate?.id}`}>
                    <Button variant="secondary" size="sm">
                      查看完整候选人资料
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 职位信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  应聘职位信息
                </CardTitle>
                <CardDescription>该职位的详细要求</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{job?.title}</h4>
                  {job?.department && (
                    <p className="text-sm text-gray-600">{job.department}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {job?.type && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">职位类型</p>
                      <p className="text-gray-900">{job.type}</p>
                    </div>
                  )}
                  {job?.workMode && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">工作模式</p>
                      <p className="text-gray-900">{job.workMode}</p>
                    </div>
                  )}
                  {job?.experienceLevel && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">经验要求</p>
                      <p className="text-gray-900">{job.experienceLevel}</p>
                    </div>
                  )}
                  {job?.location && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">工作地点</p>
                      <p className="text-gray-900">{job.location}</p>
                    </div>
                  )}
                </div>

                {job?.minSalary && job?.maxSalary && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      薪资范围
                    </p>
                    <p className="text-gray-900 font-medium">
                      {job.minSalary.toLocaleString()} - {job.maxSalary.toLocaleString()} {job.currency || 'CNY'}
                    </p>
                  </div>
                )}

                {job?.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">职位描述</p>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Link href={`/jobs/${job?.id}`}>
                    <Button variant="secondary" size="sm">
                      查看完整职位详情
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 面试记录 */}
            {application.interviews && application.interviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    面试记录
                  </CardTitle>
                  <CardDescription>该应聘的所有面试安排</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {application.interviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{interview.title}</h4>
                            <Badge variant="secondary">
                              {InterviewTypeLabels[interview.type as keyof typeof InterviewTypeLabels] || interview.type}
                            </Badge>
                            <Badge variant="secondary">
                              {InterviewStageLabels[interview.stage as keyof typeof InterviewStageLabels] || interview.stage}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>面试官：{interview.interviewer?.name || '未分配'}</p>
                            {interview.scheduledAt && (
                              <p className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {new Date(interview.scheduledAt).toLocaleString('zh-CN')}
                              </p>
                            )}
                            {interview.location && (
                              <p className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {interview.location}
                              </p>
                            )}
                          </div>
                          {interview.description && (
                            <p className="mt-2 text-sm text-gray-700">{interview.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{interview.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧附加信息 */}
          <div className="space-y-6">
            {/* 应聘属性 */}
            <Card>
              <CardHeader>
                <CardTitle>应聘属性</CardTitle>
                <CardDescription>应聘流程和时间信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">应聘状态</p>
                  <Badge className={ApplicationStatusColors[application.status]}>
                    {ApplicationStatusLabels[application.status]}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600">申请时间</p>
                  <p className="text-gray-900 text-sm">
                    {new Date(application.appliedAt).toLocaleString('zh-CN')}
                  </p>
                </div>

                {application.firstResponseAt && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">首次响应</p>
                    <p className="text-gray-900 text-sm">
                      {new Date(application.firstResponseAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                )}

                {application.lastContactAt && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">最后联系</p>
                    <p className="text-gray-900 text-sm">
                      {new Date(application.lastContactAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                )}

                {application.source && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">来源</p>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 text-sm">{sourceMap[application.source] || application.source}</p>
                    </div>
                  </div>
                )}

                {application.referralSource && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">推荐来源</p>
                    <p className="text-gray-900 text-sm">{application.referralSource}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI 匹配度 */}
            {application.matchScore && (
              <Card className="border-2 border-transparent hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                      <Star className="h-5 w-5 text-white fill-white" />
                    </div>
                    <div>
                      <div className="text-lg">AI 匹配度分析</div>
                      <div className="text-xs text-gray-500 font-normal">基于智能算法的综合评估</div>
                    </div>
                    <Badge variant="secondary" className="ml-auto bg-white/80">
                      Mock数据
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    {/* 主分数展示 - 圆形进度环 */}
                    <div className="flex items-center justify-center gap-8">
                      {/* 圆形进度 - 使用conic-gradient避免旋转问题 */}
                      {(() => {
                        const score = application.matchScore;
                        const color = score >= 90 ? '#22c55e' :
                                     score >= 75 ? '#3b82f6' :
                                     score >= 60 ? '#eab308' :
                                     '#ef4444';
                        return (
                          <div
                            className="relative rounded-full flex items-center justify-center transition-all duration-300"
                            style={{
                              width: '160px',
                              height: '160px',
                              background: `conic-gradient(${color} ${score}%, #e5e7eb ${score}% 100%)`
                            }}
                          >
                            {/* 内圆背景 */}
                            <div
                              className="rounded-full flex items-center justify-center bg-white"
                              style={{ width: '130px', height: '130px' }}
                            >
                              {/* 数字 */}
                              <div className="text-center">
                                <div className={`text-4xl font-bold ${
                                  score >= 90 ? 'text-green-600' :
                                  score >= 75 ? 'text-blue-600' :
                                  score >= 60 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {score}
                                </div>
                                <div className="text-xs text-gray-500">匹配度</div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 右侧信息 */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge className={`px-4 py-2 text-sm font-semibold ${
                            application.matchScore >= 90 ? 'bg-green-100 text-green-800 border-green-300' :
                            application.matchScore >= 75 ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            application.matchScore >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-red-100 text-red-800 border-red-300'
                          }`}>
                            {application.matchScore >= 90 ? '🌟 优秀匹配' :
                             application.matchScore >= 75 ? '✓ 良好匹配' :
                             application.matchScore >= 60 ? '△ 一般匹配' :
                             '✗ 匹配度较低'}
                          </Badge>
                        </div>

                        {/* 快速统计 */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-gray-500 text-xs">排名预测</div>
                            <div className="font-semibold text-gray-900">
                              {application.matchScore >= 90 ? '前 10%' :
                               application.matchScore >= 75 ? '前 30%' :
                               application.matchScore >= 60 ? '前 50%' :
                               '待提升'}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-gray-500 text-xs">推荐等级</div>
                            <div className="font-semibold text-gray-900">
                              {application.matchScore >= 90 ? 'A+' :
                               application.matchScore >= 75 ? 'A' :
                               application.matchScore >= 60 ? 'B' :
                               'C'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 多维度评分 */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">多维度评分详情</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* 技能匹配 */}
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">技能匹配</span>
                            <span className="text-xs font-bold text-blue-600">
                              {Math.round(application.matchScore * 0.95)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.round(application.matchScore * 0.95)}%` }}
                            />
                          </div>
                        </div>

                        {/* 经验匹配 */}
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">经验匹配</span>
                            <span className="text-xs font-bold text-green-600">
                              {Math.round(application.matchScore * 0.9)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.round(application.matchScore * 0.9)}%` }}
                            />
                          </div>
                        </div>

                        {/* 学历匹配 */}
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">学历匹配</span>
                            <span className="text-xs font-bold text-purple-600">
                              {Math.round(application.matchScore * 0.85)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.round(application.matchScore * 0.85)}%` }}
                            />
                          </div>
                        </div>

                        {/* 项目匹配 */}
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">项目匹配</span>
                            <span className="text-xs font-bold text-orange-600">
                              {Math.round(application.matchScore * 0.88)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.round(application.matchScore * 0.88)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 匹配标签 */}
                    <div className="flex flex-wrap gap-2">
                      {application.matchScore >= 90 && (
                        <>
                          <Badge className="px-3 py-1 bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors">
                            ✓ 技能高度匹配
                          </Badge>
                          <Badge className="px-3 py-1 bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors">
                            ✓ 经验完全符合
                          </Badge>
                          <Badge className="px-3 py-1 bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors">
                            ✓ 强烈推荐面试
                          </Badge>
                        </>
                      )}
                      {application.matchScore >= 75 && application.matchScore < 90 && (
                        <>
                          <Badge className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 transition-colors">
                            ✓ 技能基本匹配
                          </Badge>
                          <Badge className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 transition-colors">
                            ✓ 建议安排面试
                          </Badge>
                          <Badge className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 transition-colors">
                            ✓ 值得培养
                          </Badge>
                        </>
                      )}
                      {application.matchScore >= 60 && application.matchScore < 75 && (
                        <>
                          <Badge className="px-3 py-1 bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors">
                            △ 部分技能匹配
                          </Badge>
                          <Badge className="px-3 py-1 bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors">
                            △ 可考虑面试
                          </Badge>
                        </>
                      )}
                      {application.matchScore < 60 && (
                        <>
                          <Badge className="px-3 py-1 bg-red-100 text-red-800 border-red-300 hover:bg-red-200 transition-colors">
                            ✗ 技能匹配度低
                          </Badge>
                          <Badge className="px-3 py-1 bg-red-100 text-red-800 border-red-300 hover:bg-red-200 transition-colors">
                            ✗ 暂不建议面试
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* AI 建议 */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900">AI 智能建议</h4>
                            <Badge variant="secondary" className="text-xs">
                              基于大数据分析
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {application.matchScore >= 90 && '候选人技能和经验与职位高度匹配，各项指标均表现优异。建议：1）优先安排技术面试 2）准备有竞争力的offer 3）可作为重点培养对象。'}
                            {application.matchScore >= 75 && application.matchScore < 90 && '候选人基本符合职位要求，具备良好的发展潜力。建议：1）安排技术面试深入了解 2）评估学习能力和成长性 3）可作为备选人才。'}
                            {application.matchScore >= 60 && application.matchScore < 75 && '候选人部分条件符合，存在一定差距。建议：1）仔细评估核心技能 2）考察学习能力和项目经验 3）可考虑实习生或初级岗位。'}
                            {application.matchScore < 60 && '候选人与职位匹配度较低，多个关键指标不符。建议：1）暂时搁置面试安排 2）关注更匹配的候选人 3）如确实感兴趣，需提供更多证明材料。'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 筛选评估 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  筛选评估
                </CardTitle>
                <CardDescription>记录筛选分数和评估结果</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="screeningScore" className="text-gray-700">
                    筛选分数 (0-100)
                  </Label>
                  <Input
                    id="screeningScore"
                    type="number"
                    min="0"
                    max="100"
                    value={screeningForm.screeningScore}
                    onChange={(e) =>
                      setScreeningForm({ ...screeningForm, screeningScore: e.target.value })
                    }
                    placeholder="输入筛选分数"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="screeningNotes" className="text-gray-700">
                    筛选备注
                  </Label>
                  <Textarea
                    id="screeningNotes"
                    value={screeningForm.screeningNotes}
                    onChange={(e) =>
                      setScreeningForm({ ...screeningForm, screeningNotes: e.target.value })
                    }
                    placeholder="输入筛选评估备注..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-gray-700">筛选结果</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={screeningForm.passed === true ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setScreeningForm({ ...screeningForm, passed: true })}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      通过
                    </Button>
                    <Button
                      variant={screeningForm.passed === false ? 'danger' : 'ghost'}
                      size="sm"
                      onClick={() => setScreeningForm({ ...screeningForm, passed: false })}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      拒绝
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleScreen}
                  disabled={screening}
                  className="w-full"
                >
                  {screening ? '提交中...' : '提交筛选结果'}
                </Button>

                {application.screeningScore && (
                  <div className="pt-4 border-t space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                        当前评分
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold">
                          <span className={
                            application.screeningScore >= 85 ? 'text-green-600' :
                            application.screeningScore >= 70 ? 'text-blue-600' :
                            application.screeningScore >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }>
                            {application.screeningScore}
                          </span>
                          <span className="text-lg text-gray-400">分</span>
                        </div>
                        <Badge className={
                          application.screeningScore >= 85 ? 'bg-green-100 text-green-800' :
                          application.screeningScore >= 70 ? 'bg-blue-100 text-blue-800' :
                          application.screeningScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {application.screeningScore >= 85 ? '优秀' :
                           application.screeningScore >= 70 ? '良好' :
                           application.screeningScore >= 60 ? '及格' :
                           '待提高'}
                        </Badge>
                      </div>
                    </div>
                    {application.screeningNotes && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {application.screeningNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 快捷操作 */}
            <Card>
              <CardHeader>
                <CardTitle>快捷操作</CardTitle>
                <CardDescription>常用操作和链接</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/candidates/${candidate?.id}`} className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    查看候选人详情
                  </Button>
                </Link>
                <Link href={`/jobs/${job?.id}`} className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    查看职位详情
                  </Button>
                </Link>
                <Link href={`/candidates/${candidate?.id}/edit`} className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    编辑候选人信息
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}