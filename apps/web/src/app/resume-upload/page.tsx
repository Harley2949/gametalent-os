'use client';

// React

// Next.js

// UI Components
import { Button } from '@gametalent/ui';

// Icons
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Components
import { ResumeParseResult } from '@/components/resume-parse-result';
import { ResumeUploader } from '@/components/resume-uploader';
import { BackHeader } from '@/components/ui/BackHeader';

export default function ResumeUploadPage() {
  const [uploadedResume, setUploadedResume] = useState<{
    resumeId: string;
    candidateId: string;
  } | null>(null);

  const handleUploadSuccess = (data: {
    resumeId: string;
    candidateId: string;
    isNewCandidate: boolean;
  }) => {
    setUploadedResume({
      resumeId: data.resumeId,
      candidateId: data.candidateId,
    });
  };

  const handleReset = () => {
    setUploadedResume(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <BackHeader backText="返回首页" />

        {/* 页头 */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">简历上传与解析</h1>
          <p className="mt-2 text-sm text-gray-600">
            上传简历文件，AI 将自动提取候选人的技能、经验、教育等信息
          </p>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow p-8">
          {!uploadedResume ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  上传简历文件
                </h2>
                <p className="text-gray-600">
                  支持 PDF、Word、图片等格式，文件大小不超过 10MB
                </p>
              </div>
              <ResumeUploader onUploadSuccess={handleUploadSuccess} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">解析结果</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    AI 已自动提取候选人信息，请确认并完善
                  </p>
                </div>
                <Button
                  onClick={handleReset}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  上传新简历
                </Button>
              </div>

              <ResumeParseResult
                resumeId={uploadedResume.resumeId}
                candidateId={uploadedResume.candidateId}
              />
            </div>
          )}
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                使用提示
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>支持 PDF、DOC、DOCX、JPG、PNG 等格式</li>
                  <li>文件大小建议不超过 10MB</li>
                  <li>AI 会自动识别姓名、联系方式、工作经历、教育背景等信息</li>
                  <li>解析完成后，您可以编辑和完善候选人信息</li>
                  <li>系统会自动根据简历内容推荐合适的职位</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
