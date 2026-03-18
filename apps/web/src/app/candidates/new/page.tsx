'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/shared/Toast';
import { ArrowLeft } from 'lucide-react';
import { CandidateForm } from '@/components/candidate-form';
import { createCandidate } from '@/lib/api';

export default function NewCandidatePage() {
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (data: any) => {
    try {
      console.log('💾 [新建候选人] 正在创建候选人:', data);
      const result = await createCandidate(data);
      console.log('✅ [新建候选人] 创建成功:', result);
      toast.success('候选人创建成功');
      router.push('/candidates');
    } catch (error) {
      console.error('❌ [新建候选人] 创建失败:', error);
      toast.error('创建失败，请重试');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页头 */}
        <div className="mb-8">
          <Link href="/candidates" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">新建候选人</h1>
          <p className="mt-2 text-sm text-gray-600">
            填写候选人信息并创建记录
          </p>
        </div>

        <CandidateForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
