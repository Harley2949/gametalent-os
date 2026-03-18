'use client';

import { Button } from '@gametalent/ui';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { JobForm } from '@/components/job-form';
import { useToast } from '@/components/shared/Toast';
import { BackHeader } from '@/components/ui/BackHeader';
import { fetchJob, updateJob } from '@/lib/api';
import { UpdateJobDto } from '@/types/job';

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await fetchJob(jobId);
      setJob(data);
    } catch (error) {
      console.error('加载职位详情失败:', error);
      toast.error('加载职位详情失败');
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const handleSubmit = async (data: UpdateJobDto) => {
    try {
      setSubmitting(true);
      await updateJob(jobId, data);
      toast.success('职位更新成功');
      router.push(`/jobs/${jobId}`);
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">职位不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统一的返回头部 */}
        <BackHeader
          title="编辑职位"
          fallbackHref={`/jobs/${jobId}`}
        />

        {/* 表单 */}
        <JobForm isEditing={true} job={job} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
