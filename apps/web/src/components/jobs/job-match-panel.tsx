'use client';

import { Button } from '@gametalent/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gametalent/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { Progress } from '@gametalent/ui';
import {
  Sparkles,
  TrendingUp,
  Users,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Target,
  Brain,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import {
  getBestMatches,
  getMatchStatistics,
  calculateAllForJob,
  invalidateJobCache,
} from '@/lib/api';
import type { JobMatch, MatchStatistics } from '@/types/job-match';

interface JobMatchPanelProps {
  jobId: string;
  onUpdate?: () => void;
}

const getMatchScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

const getMatchScoreLabel = (score: number) => {
  if (score >= 90) return '优秀匹配';
  if (score >= 75) return '良好匹配';
  if (score >= 60) return '一般匹配';
  return '匹配度低';
};

export function JobMatchPanel({ jobId, onUpdate }: JobMatchPanelProps) {
  const [statistics, setStatistics] = useState<MatchStatistics | null>(null);
  const [bestMatches, setBestMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadMatchData();
  }, [jobId]);

  const loadMatchData = async () => {
    try {
      setLoading(true);
      const [statsData, matchesData] = await Promise.all([
        getMatchStatistics(jobId),
        getBestMatches(jobId, 10),
      ]);
      setStatistics(statsData);
      setBestMatches(matchesData || []);
    } catch (error) {
      console.error('加载匹配数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateAll = async () => {
    setCalculating(true);
    try {
      await calculateAllForJob(jobId);
      await loadMatchData();
      onUpdate?.();
    } catch (error) {
      console.error('批量计算失败:', error);
    } finally {
      setCalculating(false);
    }
  };

  const handleRefreshCache = async () => {
    try {
      await invalidateJobCache(jobId);
      await loadMatchData();
    } catch (error) {
      console.error('刷新缓存失败:', error);
    }
  };

  const formatScore = (score: number) => {
    return Math.round(score);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 py-8">加载匹配数据...</div>
        </CardContent>
      </Card>
    );
  }

  const scoreDistribution = statistics?.scoreDistribution || {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
  };

  const totalMatches = statistics?.totalMatches || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI 匹配分析
              </CardTitle>
              <CardDescription>基于AI的候选人职位匹配度分析</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefreshCache}
                disabled={calculating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={calculating || totalMatches === 0}
              >
                <Brain className="h-4 w-4 mr-2" />
                批量计算
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {totalMatches === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-2">暂无匹配数据</p>
              <p className="text-sm text-gray-400 mb-4">点击"批量计算"为所有候选人计算匹配度</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 统计概览 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">总匹配数</p>
                      <p className="text-3xl font-bold text-gray-900">{totalMatches}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">平均分</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatScore(statistics?.averageScore || 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">优秀匹配 (90+)</p>
                      <p className="text-3xl font-bold text-gray-900">{scoreDistribution.excellent}</p>
                    </div>
                    <Sparkles className="h-8 w-8 text-blue-500 opacity-80" />
                  </div>
                </div>
              </div>

              {/* 分数分布 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">匹配度分布</h3>
                <div className="space-y-3">
                  {[
                    { label: '优秀匹配 (90+)', score: 90, count: scoreDistribution.excellent, color: 'bg-green-500' },
                    { label: '良好匹配 (75-89)', score: 75, count: scoreDistribution.good, color: 'bg-blue-500' },
                    { label: '一般匹配 (60-74)', score: 60, count: scoreDistribution.fair, color: 'bg-yellow-500' },
                    { label: '匹配度低 (<60)', score: 0, count: scoreDistribution.poor, color: 'bg-red-500' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-900">{item.count} 人</span>
                      </div>
                      <Progress
                        value={totalMatches > 0 ? (item.count / totalMatches) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 最佳匹配列表 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Top 10 最佳匹配</h3>
                <div className="space-y-2">
                  {bestMatches.map((match, index) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {match.candidate?.name || '未知候选人'}
                            </p>
                            {match.matchDetails?.skillsMatch && (
                              <Badge variant="secondary" className="text-xs">
                                技能匹配: {formatScore(match.matchDetails.skillsMatch)}%
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {match.candidate?.currentCompany && (
                              <span>{match.candidate.currentCompany}</span>
                            )}
                            {match.candidate?.currentTitle && (
                              <>
                                <span>·</span>
                                <span>{match.candidate.currentTitle}</span>
                              </>
                            )}
                          </div>
                          {match.matchDetails?.reasoning && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {match.matchDetails.reasoning}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl font-bold px-3 py-1 rounded-lg border ${getMatchScoreColor(match.matchScore)}`}>
                          {formatScore(match.matchScore)}
                        </div>
                        <Badge variant="secondary" className={getMatchScoreColor(match.matchScore)}>
                          {getMatchScoreLabel(match.matchScore)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 批量计算确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>批量计算匹配度</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>确定要为该职位的所有候选人计算匹配度吗？</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">注意事项：</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>此操作将为所有候选人重新计算匹配度</li>
                        <li>计算时间取决于候选人数量</li>
                        <li>计算过程中请勿关闭页面</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={calculating}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCalculateAll}
              disabled={calculating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {calculating ? '计算中...' : '确认计算'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
