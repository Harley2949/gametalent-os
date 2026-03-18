'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/shared/Toast';
import { BackHeader } from '@/components/ui/BackHeader';
import { CandidateForm } from '@/components/candidate-form';
import { fetchCandidate, updateCandidate } from '@/lib/api';
import type { Candidate } from '@/types/candidate';

export default function EditCandidatePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadCandidate();
    }
  }, [params.id]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      const data = await fetchCandidate(params.id as string);
      setCandidate(data);
    } catch (error) {
      console.error('加载候选人失败:', error);
      toast.error('加载候选人失败');
      router.push('/candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      console.log('💾 [编辑页面] 正在保存候选人数据:', data);
      const updated = await updateCandidate(params.id as string, data);
      console.log('✅ [编辑页面] 保存成功:', updated);
      toast.success('✅ 候选人信息已更新，正在返回列表...');

      // 使用 router.refresh() 确保服务器端数据刷新
      router.push('/candidates');
      router.refresh();
    } catch (error) {
      console.error('❌ [编辑页面] 保存失败:', error);
      toast.error('保存失败，请重试');
      throw error;
    }
  };

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
          <Link href="/candidates">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              返回列表
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统一的返回头部 */}
        <BackHeader
          title="编辑候选人"
          fallbackHref={`/candidates/${candidate.id}`}
        />

        <CandidateForm candidate={candidate} isEditing={true} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
