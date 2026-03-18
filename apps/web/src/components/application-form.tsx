'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@gametalent/ui';
import { Input } from '@gametalent/ui';
import { Textarea } from '@gametalent/ui';
import { Label } from '@gametalent/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gametalent/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  TransparencyLevel,
  TransparencyLevelLabels,
} from '@/types/application';
import { fetchCandidates } from '@/lib/api';
import { fetchJobs } from '@/lib/api';

interface ApplicationFormProps {
  isEditing?: boolean;
  application?: any;
  onSubmit: (data: CreateApplicationDto | UpdateApplicationDto) => Promise<void>;
}

export function ApplicationForm({ isEditing = false, application, onSubmit }: ApplicationFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    jobId: application?.jobId || '',
    candidateId: application?.candidateId || '',
    coverLetter: application?.coverLetter || '',
    source: application?.source || 'DIRECT',
    referralSource: application?.referralSource || '',
    transparencyLevel: application?.transparencyLevel || 'STANDARD',
  });

  // 加载数据
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 开始加载数据...');
        const [candidatesData, jobsData] = await Promise.all([
          fetchCandidates({ page: 1, pageSize: 100 }),
          fetchJobs({ page: 1, pageSize: 100 }),
        ]);

        console.log('✅ 加载的候选人数据:', candidatesData);
        console.log('✅ 加载的职位数据:', jobsData);

        setCandidates(candidatesData.data || []);
        setJobs(jobsData.data || []);

        console.log('📊 状态更新:', {
          candidates: candidatesData.data?.length || 0,
          jobs: jobsData.data?.length || 0
        });

        if (!candidatesData.data || candidatesData.data.length === 0) {
          console.warn('⚠️ 候选人列表为空，请先创建候选人');
        }
        if (!jobsData.data || jobsData.data.length === 0) {
          console.warn('⚠️ 职位列表为空，请先创建职位');
        }
      } catch (error) {
        console.error('❌ 加载数据失败:', error);

        // 检查是否是网络错误
        const isNetworkError = error instanceof TypeError && error.message.includes('fetch');

        if (isNetworkError) {
          toast.error('无法连接到服务器，已切换到开发模式（Mock数据）');
          console.warn('⚠️ API服务不可用，请确保后端服务运行在 localhost:3006');
        } else {
          toast.error('加载数据失败，请刷新页面重试');
        }

        // 确保设置空数组，避免undefined
        setCandidates([]);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // 验证
    if (!formData.jobId || !formData.candidateId) {
      toast.warning('请选择职位和候选人');
      setSubmitting(false);
      return;
    }

    try {
      const data: CreateApplicationDto = {
        jobId: formData.jobId,
        candidateId: formData.candidateId,
        coverLetter: formData.coverLetter || undefined,
        source: formData.source,
        referralSource: formData.referralSource || undefined,
        transparencyLevel: formData.transparencyLevel as TransparencyLevel,
      };

      await onSubmit(data);
      router.push('/applications');
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">加载中...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="candidateId">
              候选人 <span className="text-red-500">*</span>
            </Label>
            {candidates.length === 0 && (
              <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                ⚠️ 候选人列表为空或加载失败
              </div>
            )}
            <Select
              value={formData.candidateId}
              onValueChange={(value) => setFormData({ ...formData, candidateId: value })}
              disabled={isEditing || candidates.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={candidates.length === 0 ? "无可用候选人" : "选择候选人"} />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.currentCompany || '无公司'} ({candidate.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {candidates.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                共 {candidates.length} 个候选人可选
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="jobId">
              职位 <span className="text-red-500">*</span>
            </Label>
            {jobs.length === 0 && (
              <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                ⚠️ 职位列表为空或加载失败
                <br />
                <span className="text-xs">请先 <Link href="/jobs/new" className="text-blue-600 hover:underline font-medium">创建职位</Link> 或检查后端服务</span>
              </div>
            )}
            <Select
              value={formData.jobId}
              onValueChange={(value) => setFormData({ ...formData, jobId: value })}
              disabled={isEditing || jobs.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={jobs.length === 0 ? "无可用职位" : "选择职位"} />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} - {job.department || '无部门'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {jobs.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                共 {jobs.length} 个职位可选
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="source">来源</Label>
            <Select
              value={formData.source}
              onValueChange={(value) => setFormData({ ...formData, source: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIRECT">直投</SelectItem>
                <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                <SelectItem value="REFERRAL">内推</SelectItem>
                <SelectItem value="AGENCY">猎头</SelectItem>
                <SelectItem value="OTHER">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.source === 'REFERRAL' && (
            <div>
              <Label htmlFor="referralSource">推荐人/推荐来源</Label>
              <Input
                id="referralSource"
                value={formData.referralSource}
                onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                placeholder="请输入推荐人姓名或推荐来源"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详细信息 */}
      <Card>
        <CardHeader>
          <CardTitle>详细信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="coverLetter">求职信</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              placeholder="候选人的求职信或自荐信..."
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="transparencyLevel">透明度级别</Label>
            <Select
              value={formData.transparencyLevel}
              onValueChange={(value) =>
                setFormData({ ...formData, transparencyLevel: value as TransparencyLevel })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TransparencyLevelLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              控制候选人可见的信息范围
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={submitting}
        >
          取消
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? '提交中...' : isEditing ? '保存' : '创建应聘记录'}
        </Button>
      </div>
    </form>
  );
}
