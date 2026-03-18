'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from './shared/Toast';

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'parsing' | 'success' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

interface ResumeUploaderProps {
  candidateId?: string;
  onUploadSuccess?: (data: {
    resumeId: string;
    candidateId: string;
    isNewCandidate: boolean;
    parsedData?: any;
  }) => void;
  className?: string;
}

export function ResumeUploader({
  candidateId,
  onUploadSuccess,
  className = '',
}: ResumeUploaderProps) {
  const router = useRouter();
  const toast = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  // 处理文件选择
  const handleFiles = useCallback((newFiles: FileList) => {
    const validFiles: UploadFile[] = [];

    Array.from(newFiles).forEach(file => {
      // 验证文件类型
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFiles(prev => [...prev, {
          id: Math.random().toString(36).substring(7),
          file,
          status: 'error',
          progress: 0,
          error: `不支持的文件类型：${file.type}`,
        }]);
        return;
      }

      // 验证文件大小
      if (file.size > MAX_FILE_SIZE) {
        setFiles(prev => [...prev, {
          id: Math.random().toString(36).substring(7),
          file,
          status: 'error',
          progress: 0,
          error: `文件大小超过 5MB 限制`,
        }]);
        return;
      }

      validFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        status: 'pending',
        progress: 0,
      });
    });

    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // 文件选择处理
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  // 移除文件
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  // 批量上传文件
  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    console.log('🚀 开始批量上传文件...');

    // 将所有待上传文件标记为上传中
    setFiles(prev => prev.map(f =>
      f.status === 'pending' ? { ...f, status: 'uploading', progress: 10 } : f
    ));

    try {
      // 准备批量上传的 FormData
      const formData = new FormData();
      pendingFiles.forEach(fileItem => {
        formData.append('files', fileItem.file);
      });

      // 添加超时控制（60秒，因为批量上传需要更长时间）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      // 更新状态为解析中
      setFiles(prev => prev.map(f =>
        f.status === 'uploading' ? { ...f, status: 'parsing', progress: 50 } : f
      ));

      console.log(`⏳ 发送批量上传请求，文件数: ${pendingFiles.length}`);

      const response = await fetch('http://localhost:3006/api/resume-upload/batch', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('✅ 收到响应, status:', response.status);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: '服务器错误' }));
        console.error('❌ 批量上传失败:', error);
        throw new Error(error.message || '批量上传失败');
      }

      const data = await response.json();
      console.log('✅ 批量解析完成:', data);
      console.log('📦 data.data 详细内容:', data.data);

      // 检查业务逻辑是否成功
      if (!data.success || !data.data) {
        throw new Error(data.message || '批量上传失败：服务器返回错误');
      }

      // 注意：后端返回的字段名是 successful（而不是 success）
      const { total, successful, failed, results } = data.data;
      const successCount = successful || 0;
      console.log(`📊 批量上传结果: 总数 ${total}, 成功 ${successCount}, 失败 ${failed}`);
      console.log('📋 results 数组:', results);

      // 更新每个文件的状态
      const fileMap = new Map(pendingFiles.map(f => [f.file.name, f]));

      results.forEach((result: any) => {
        const fileItem = fileMap.get(result.fileName);
        if (fileItem) {
          // 后端返回的 result.success 是布尔值，需要转换为 status
          if (result.success === true) {
            setFiles(prev => prev.map(f =>
              f.id === fileItem.id ? {
                ...f,
                status: 'success',
                progress: 100,
                result: {
                  resumeId: result.resumeId,
                  candidateId: result.candidateId,
                  isNewCandidate: result.isNewCandidate || false,
                  parsedData: result.parsedData
                }
              } : f
            ));
          } else {
            setFiles(prev => prev.map(f =>
              f.id === fileItem.id ? {
                ...f,
                status: 'error',
                progress: 0,
                error: result.error || '解析失败',
              } : f
            ));
          }
        }
      });

      // 显示批量上传结果汇总
      if (successCount > 0) {
        toast.success(
          `✅ 批量上传完成！成功 ${successCount} 个${failed > 0 ? `，失败 ${failed} 个` : ''}`,
          5000
        );
      } else if (failed > 0) {
        toast.error(`❌ 批量上传失败：${failed} 个文件处理失败`, 5000);
      }

      // 触发成功回调（对于成功的文件）
      results.forEach((result: any) => {
        if (result.success === true && result.resumeId) {
          onUploadSuccess?.({
            resumeId: result.resumeId,
            candidateId: result.candidateId,
            isNewCandidate: result.isNewCandidate || false,
            parsedData: result.parsedData
          });
        }
      });

      // 如果有成功的文件，3秒后跳转到候选人列表页面
      if (successCount > 0) {
        setTimeout(() => {
          console.log('🚀 跳转到候选人列表页面');
          router.push('/candidates');
        }, 3000);
      }
    } catch (error) {
      console.error('❌ 批量上传捕获到错误:', error);

      const errorMessage = error instanceof Error
        ? (error.name === 'AbortError' ? '请求超时（60秒），请检查后端服务' : error.message)
        : '批量上传失败';

      // 将所有上传中的文件标记为错误
      setFiles(prev => prev.map(f =>
        f.status === 'uploading' || f.status === 'parsing' ? {
          ...f,
          status: 'error',
          progress: 0,
          error: errorMessage,
        } : f
      ));

      toast.error(`❌ ${errorMessage}`, 5000);
    }

    setIsUploading(false);
    console.log('🏁 批量上传流程结束');
  };

  // 重新上传
  const retryUpload = useCallback((id: string) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status: 'pending', progress: 0, error: undefined } : f
    ));
  }, []);

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const pendingFiles = files.filter(f => f.status === 'pending').length;
  const successFiles = files.filter(f => f.status === 'success').length;
  const errorFiles = files.filter(f => f.status === 'error').length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>上传简历</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          支持 PDF、JPG、PNG 格式，最大 5MB
        </p>
      </CardHeader>
      <CardContent>
        {/* 拖拽区域 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            accept=".pdf,image/jpeg,image/jpg,image/png"
            multiple
            onChange={handleFileSelect}
          />
          <label htmlFor="resume-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              拖拽文件到此处，或点击选择文件
            </p>
            <p className="text-sm text-gray-500">
              支持批量上传
            </p>
          </label>
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                已选择 {files.length} 个文件
              </span>
              <div className="flex gap-4">
                {successFiles > 0 && (
                  <span className="text-green-600">成功 {successFiles}</span>
                )}
                {errorFiles > 0 && (
                  <span className="text-red-600">失败 {errorFiles}</span>
                )}
              </div>
            </div>

            {files.map(file => (
              <div
                key={file.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.file.size)}
                      {file.status === 'parsing' && ' · AI 解析中...'}
                    </p>
                  </div>

                  {/* 状态图标 */}
                  <div className="flex items-center gap-2">
                    {file.status === 'pending' && (
                      <span className="text-xs text-gray-500">等待上传</span>
                    )}
                    {file.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                    {file.status === 'parsing' && (
                      <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <button
                          onClick={() => retryUpload(file.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          重试
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      disabled={file.status === 'uploading' || file.status === 'parsing'}
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* 错误信息 */}
                {file.status === 'error' && file.error && (
                  <p className="mt-2 text-sm text-red-600">{file.error}</p>
                )}

                {/* 成功信息 */}
                {file.status === 'success' && file.result && (
                  <div className="mt-2 space-y-1">
                    {file.result.isNewCandidate ? (
                      <p className="text-sm text-green-600">
                        ✅ 已创建候选人：<span className="font-medium">{file.result.parsedData?.name || '未知'}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-green-600">
                        ✅ 已更新候选人：<span className="font-medium">{file.result.parsedData?.name || '未知'}</span>
                      </p>
                    )}
                    {file.result.parsedData?.email && (
                      <p className="text-xs text-gray-600">
                        📧 {file.result.parsedData.email}
                      </p>
                    )}
                    {file.result.parsedData?.skills && file.result.parsedData.skills.length > 0 && (
                      <p className="text-xs text-gray-600">
                        🔧 {file.result.parsedData.skills.length} 项技能
                      </p>
                    )}
                  </div>
                )}

                {/* 进度条 */}
                {(file.status === 'uploading' || file.status === 'parsing') && (
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 上传按钮 */}
        {pendingFiles > 0 && !isUploading && successFiles === 0 && (
          <div className="mt-6 flex gap-3">
            <Button
              onClick={uploadFiles}
              disabled={isUploading}
              className="flex-1"
            >
              上传 {pendingFiles} 个文件
            </Button>
            <Button
              variant="secondary"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              清空列表
            </Button>
          </div>
        )}

        {/* 全部失败时的重试选项 */}
        {!isUploading && pendingFiles === 0 && successFiles === 0 && errorFiles > 0 && (
          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setFiles([])}
              className="flex-1"
            >
              清空并重新选择
            </Button>
          </div>
        )}

        {/* 上传完成后的汇总信息 */}
        {!isUploading && successFiles > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-green-800">
                  ✅ 批量上传完成
                </p>
                <p className="text-sm text-green-700 mt-1">
                  成功 {successFiles} 个文件
                  {errorFiles > 0 && `，失败 ${errorFiles} 个文件`}
                </p>
              </div>
              <Button
                onClick={() => router.push('/candidates')}
                size="sm"
              >
                查看候选人列表 →
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setFiles([])}
                size="sm"
                className="flex-1"
              >
                上传更多简历
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
