'use client';

import { Card, CardContent } from '@gametalent/ui';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StageHistoryEntry {
  id: string;
  fromStage: string | null;
  toStage: string;
  changedBy: string | null;
  changeReason: string | null;
  changeType: string;
  createdAt: Date;
}

interface StageHistoryResponse {
  candidate: {
    id: string;
    name: string;
    currentStage: string | null;
  };
  history: StageHistoryEntry[];
}

interface StageHistoryTimelineProps {
  candidateId: string;
}

const stageColors: Record<string, string> = {
  初筛: 'bg-blue-100 text-blue-700 border-blue-200',
  面试: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Offer: 'bg-purple-100 text-purple-700 border-purple-200',
  录用: 'bg-green-100 text-green-700 border-green-200',
  淘汰: 'bg-red-100 text-red-700 border-red-200',
};

const stageIcons: Record<string, React.ReactNode> = {
  初筛: <CheckCircle2 className="h-4 w-4" />,
  面试: <Clock className="h-4 w-4" />,
  Offer: <CheckCircle2 className="h-4 w-4" />,
  录用: <CheckCircle2 className="h-4 w-4" />,
  淘汰: <XCircle className="h-4 w-4" />,
};

export function StageHistoryTimeline({ candidateId }: StageHistoryTimelineProps) {
  const [data, setData] = useState<StageHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStageHistory = async () => {
      try {
        if (!isMounted) return;

        setLoading(true);
        setError(null);

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

        const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}/stage-history`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error('获取阶段历史失败');
        }

        const result = await response.json();

        if (!isMounted) return;

        // 检查响应格式
        if (result.success && result.data) {
          setData(result.data);
        } else {
          // 如果返回格式不正确，设置空数据
          setData({
            candidate: {
              id: candidateId,
              name: '',
              currentStage: null,
            },
            history: [],
          });
        }
      } catch (err) {
        console.error('获取阶段历史失败:', err);
        if (isMounted) {
          setError('加载失败，请稍后重试');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStageHistory();

    return () => {
      isMounted = false;
    };
  }, [candidateId]);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 0 ? '刚刚' : `${diffMinutes}分钟前`;
      }
      return `${diffHours}小时前`;
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">阶段变更历史</h3>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">加载中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">阶段变更历史</h3>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.history || data.history.length === 0) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">阶段变更历史</h3>
            {data?.candidate?.currentStage && (
              <span className={`text-xs px-2 py-1 rounded-md border ${stageColors[data.candidate.currentStage] || 'bg-gray-100 text-gray-700'}`}>
                当前: {data.candidate.currentStage}
              </span>
            )}
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">暂无变更记录</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">阶段变更历史</h3>
          {data.candidate.currentStage && (
            <span className={`text-xs px-2 py-1 rounded-md border ${stageColors[data.candidate.currentStage] || 'bg-gray-100 text-gray-700'}`}>
              当前: {data.candidate.currentStage}
            </span>
          )}
        </div>

        <div className="space-y-4">
          {data?.history?.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Timeline line */}
              {index < (data.history?.length || 0) - 1 && (
                <div className="absolute left-[11px] top-6 w-px h-full bg-gray-200" />
              )}

              <div className="flex items-start gap-3">
                {/* Timeline dot */}
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  entry.toStage === '淘汰'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-blue-50 border-blue-300'
                }`}>
                  {stageIcons[entry.toStage] || <CheckCircle2 className="h-3 w-3" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    {entry.fromStage && (
                      <>
                        <span className={`text-xs px-2 py-0.5 rounded border ${stageColors[entry.fromStage] || 'bg-gray-100 text-gray-700'}`}>
                          {entry.fromStage}
                        </span>
                        <span className="text-gray-400">→</span>
                      </>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${stageColors[entry.toStage] || 'bg-gray-100 text-gray-700'}`}>
                      {entry.toStage}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-1">
                    {formatDate(entry.createdAt)}
                  </div>

                  {entry.changeReason && (
                    <div className="text-xs text-gray-600 mt-1">
                      备注: {entry.changeReason}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-1">
                    {entry.changeType === 'MANUAL' ? '手动修改' : '系统自动'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
