'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@gametalent/ui';
import { Card } from '@gametalent/ui';
import { CardContent } from '@gametalent/ui';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Clock, Edit2, Trash2 } from 'lucide-react';
import { RightActionPanel } from '@/components/candidates/right-action-panel';
import { StageHistoryTimeline } from '@/components/candidates/stage-history-timeline';
import type { Candidate } from '@/types/candidate';

const statusMap = {
  ACTIVE: { label: '初筛', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  INACTIVE: { label: '非活跃', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  HIRED: { label: '已录用', color: 'bg-green-100 text-green-700 border-green-200' },
  ARCHIVED: { label: '已归档', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidate();
  }, [params.id]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      const response = await fetch(`${API_BASE_URL}/api/candidates/${params.id}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('获取候选人信息失败');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || '获取候选人信息失败');
      }

      setCandidate(result.data);
    } catch (error) {
      console.error('获取候选人信息失败:', error);
      // 使用 Mock 数据
      setCandidate({
        id: params.id as string,
        name: '王强',
        email: 'wangqiang@example.com',
        phoneNumber: '13800138003',
        location: '深圳',
        currentTitle: '服务器开发工程师',
        currentCompany: '网易游戏',
        yearsOfExperience: 10,
        expectedSalary: '40-50K',
        noticePeriod: '1个月',
        status: 'ACTIVE',
        source: 'DIRECT',
        stage: 'INITIAL_SCREENING',
        tags: ['C++', '服务器开发'],
        createdAt: '2024-02-15T00:00:00.000Z',
        updatedAt: '2024-03-08T00:00:00.000Z',
      } as Candidate);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">候选人不存在</p>
          <Link href="/candidates"><Button variant="ghost">返回列表</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回导航 */}
        <div className="mb-6">
          <Link href="/candidates" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            返回候选人列表
          </Link>
        </div>

        {/* 面包屑导航 */}
        <nav className="flex items-center gap-2 text-sm mb-6 text-gray-600">
          <Link href="/candidates" className="hover:text-gray-900">候选人</Link>
          <span>/</span>
          <span className="text-gray-900">{candidate.name}</span>
        </nav>

        {/* 应聘记录横幅 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">应聘记录:</span>
                <span className="text-sm text-gray-900">游戏服务器开发工程师 @ 技术部</span>
                <span className="text-xs text-gray-500">2026/3/13</span>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">SHORTLISTED</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 候选人基本信息卡片 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20 border-2 border-gray-200">
                  <AvatarFallback className="bg-blue-50 text-blue-600 text-xl font-semibold">
                    {getInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
                    <Badge className={statusMap[candidate.status].color}>
                      {statusMap[candidate.status].label}
                    </Badge>
                  </div>
                  <p className="text-gray-600">
                    {candidate.currentTitle} @ {candidate.currentCompany}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Edit2 className="h-4 w-4" />编辑
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 gap-2">
                  <Trash2 className="h-4 w-4" />删除
                </Button>
              </div>
            </div>

            {/* 联系方式和职业信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{candidate.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{candidate.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{candidate.yearsOfExperience}年经验</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{candidate.expectedSalary}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">离职期:</span>
                      <span className="text-sm text-gray-700">{candidate.noticePeriod}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* 主要内容区域 - 左右两栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 简历预览 */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">简历</h3>
                <div className="text-center text-gray-500 py-8">
                  <FileIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>简历预览区域</p>
                  <p className="text-sm text-gray-400 mt-2">（待上传简历）</p>
                </div>
              </CardContent>
            </Card>

            {/* 教育经历 */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">教育经历</h3>
                <div className="text-sm text-gray-500">暂无教育经历记录</div>
              </CardContent>
            </Card>

            {/* 工作经历 */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">工作经历</h3>
                <div className="text-sm text-gray-500">暂无工作经历记录</div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧面板 */}
          <div className="space-y-6">
            <RightActionPanel
              candidateId={candidate.id}
              candidate={candidate}
              onStageChange={(newStage) => {
                // Map Chinese stage names to enum values
                const stageMap: Record<string, 'INITIAL_SCREENING' | 'INTERVIEW' | 'OFFER' | 'ONBOARDING' | 'HIRED' | 'REJECTED'> = {
                  '初筛': 'INITIAL_SCREENING',
                  '面试': 'INTERVIEW',
                  'Offer': 'OFFER',
                  '入职': 'ONBOARDING',
                  '已入职': 'HIRED',
                  '淘汰': 'REJECTED',
                };
                setCandidate({ ...candidate, stage: stageMap[newStage] || 'INITIAL_SCREENING' });
              }}
            />
            <StageHistoryTimeline candidateId={candidate.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

const FileIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5a2 2 0 012 2v14a2 2 0 01-2 2h-6a2 2 0 01-2-2V9a2 2 0 012-2h2" />
  </svg>
);
