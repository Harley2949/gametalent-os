'use client';

import { Button } from '@gametalent/ui';
import {
  Card,
  CardContent,
} from '@gametalent/ui';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApplicationFormTemp } from '@/components/application-form-temp';
import { BackHeader } from '@/components/ui/BackHeader';
import { createApplication } from '@/lib/api';

export default function NewApplicationPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await createApplication(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <span className="text-gray-900 font-medium">新建应聘记录</span>
        </nav>

        {/* 页面标题卡片 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">新建应聘记录</h1>
                </div>
                <p className="text-gray-600">
                  为候选人创建新的应聘记录，选择职位并填写相关信息
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 表单 */}
        <ApplicationFormTemp onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
