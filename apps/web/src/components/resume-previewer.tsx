'use client';

import { useState, useRef } from 'react';
import { FileText, Download, ZoomIn, ZoomOut, Maximize2, Printer } from 'lucide-react';
import { Button } from '@gametalent/ui';

interface Resume {
  id: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: 'txt' | 'pdf' | 'doc' | 'docx';
  content?: string;
  createdAt: string;
}

interface ResumePreviewerProps {
  resumes: Resume[];
}

// Helper functions to create style objects
const getTextStyle = (scale: number) => ({
  maxHeight: '800px',
  transform: `scale(${scale})`,
  transformOrigin: 'top left' as const,
});

const getPdfStyle = (scale: number) => ({
  height: `${800 * scale}px`,
  transformOrigin: 'top left' as const,
});

export function ResumePreviewer({ resumes }: ResumePreviewerProps) {
  const [selectedResumeIndex, setSelectedResumeIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const selectedResume = resumes[selectedResumeIndex];
  const isPdf = selectedResume?.fileType === 'pdf' || selectedResume?.fileName?.endsWith('.pdf');
  const isTxt = selectedResume?.fileType === 'txt' || selectedResume?.fileName?.endsWith('.txt');

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));
  const handleResetZoom = () => setScale(1);

  const handlePrint = () => {
    window.print();
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (contentRef.current) {
        contentRef.current.requestFullscreen().catch((err) => {
          console.error('无法进入全屏模式:', err);
        });
      }
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    if (selectedResume?.fileUrl) {
      const link = document.createElement('a');
      link.href = selectedResume.fileUrl;
      link.download = selectedResume.fileName || '简历';
      link.click();
    }
  };

  if (!selectedResume) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">暂无简历</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 简历选择器（多份简历时显示） */}
      {resumes.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">选择简历：</span>
          <div className="flex flex-wrap gap-2">
            {resumes.map((resume, index) => (
              <button
                key={resume.id}
                onClick={() => {
                  setSelectedResumeIndex(index);
                  setScale(1);
                }}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  index === selectedResumeIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {resume.fileName || `简历 ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          上传于 {new Date(selectedResume.createdAt).toLocaleDateString('zh-CN')}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="gap-1"
            title="缩小"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="gap-1"
            title="放大"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            className="text-xs"
          >
            重置
          </Button>
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="gap-1"
            title="打印"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            className="gap-1"
            title="全屏"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="gap-1"
            title="下载"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 简历内容预览区 */}
      <div
        ref={contentRef}
        className="relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
        style={{ minHeight: '600px' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-gray-600">加载中...</div>
          </div>
        )}

        {isTxt || selectedResume.content ? (
          /* TXT 文本预览 */
          <div
            className="p-6 overflow-auto custom-scrollbar"
            style={getTextStyle(scale)}
          >
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
              {selectedResume.content || '暂无内容'}
            </pre>
          </div>
        ) : isPdf || selectedResume.fileUrl ? (
          /* PDF 预览 */
          <div className="w-full" style={getPdfStyle(scale)}>
            <iframe
              src={selectedResume.fileUrl + '#toolbar=0&navpanes=0&scrollbar=1'}
              className="w-full h-full border-0"
              title="简历预览"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                console.error('PDF 加载失败');
              }}
            />
          </div>
        ) : (
          /* 不支持的文件类型 */
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <FileText className="h-16 w-16 mb-4 text-gray-300" />
            <p className="mb-2">此文件类型暂不支持在线预览</p>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              下载文件
            </Button>
          </div>
        )}
      </div>

      {/* 文件信息 */}
      <div className="text-xs text-gray-500 flex items-center gap-4">
        <span>文件名：{selectedResume.fileName || '未知'}</span>
        <span>类型：{(selectedResume.fileType || '未知').toUpperCase()}</span>
      </div>

      {/* 自定义滚动条样式 */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}
