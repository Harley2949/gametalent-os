'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import {
  Briefcase, Users, FileText, Calendar, Plus, ArrowRight, BarChart3,
  Activity, PieChart as PieChartIcon, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import {
  fetchJobStats, fetchCandidateStats, fetchApplicationStats, fetchInterviewStats,
  fetchDashboardOverview, fetchFunnelAnalysis, fetchTimeCycleAnalysis, fetchSourceEffectiveness
} from '@/lib/api';

interface DashboardStats {
  jobs: { total: number; published: number; draft: number; todayNew: number };
  candidates: { total: number; active: number; newThisWeek: number };
  applications: { total: number; pending: number; interviewed: number; offered: number };
  interviews: { total: number; scheduled: number; completed: number; todayCount: number };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dashboardOverview, setDashboardOverview] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [timeCycleData, setTimeCycleData] = useState<any>(null);
  const [sourceData, setSourceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 计算默认日期范围：最近30天
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [jobsData, candidatesData, applicationsData, interviewsData, overview, funnel, timeCycle, source] =
        await Promise.all([
          fetchJobStats().catch(() => ({ total: 0, published: 0, draft: 0, todayNew: 0 })),
          fetchCandidateStats().catch(() => ({ total: 0, active: 0, newThisWeek: 0 })),
          fetchApplicationStats().catch(() => ({ total: 0, pending: 0, interviewed: 0, offered: 0 })),
          fetchInterviewStats().catch(() => ({ total: 0, scheduled: 0, completed: 0, todayCount: 0 })),
          fetchDashboardOverview({ days: 7 }).catch(() => null),
          fetchFunnelAnalysis({ startDate, endDate }).catch(() => null),
          fetchTimeCycleAnalysis({ startDate, endDate }).catch(() => null),
          fetchSourceEffectiveness({ startDate, endDate }).catch(() => null),
        ]);
      setStats({ jobs: jobsData, candidates: candidatesData, applications: applicationsData, interviews: interviewsData });
      setDashboardOverview(overview);
      setFunnelData(funnel);
      setTimeCycleData(timeCycle);
      setSourceData(source);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">控制台</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 border border-gray-200 animate-pulse">
                <div className="h-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const trendChartData = dashboardOverview?.trend?.map((t: any) => ({
    date: new Date(t.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    应聘: t.applications, 面试: t.interviews, Offer: t.offers,
  })) || [];

  const funnelChartData = funnelData?.funnel?.map((f: any) => ({
    name: f.stage, count: f.count, percentage: f.percentage,
  })) || [];

  const timeCycleChartData = timeCycleData?.timeCycles?.map((t: any) => ({
    name: t.stage, 平均天数: t.averageDays, 中位数: t.medianDays,
  })) || [];

  const sourceChartData = sourceData?.sources?.slice(0, 6).map((s: any) => ({
    name: s.source === 'LINKEDIN' ? 'LinkedIn' : s.source === 'REFERRAL' ? '内推' : s.source === 'DIRECT' ? '直投' : s.source,
    value: s.candidates, 转化率: s.conversionRate,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页头 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">控制台</h1>
            <p className="mt-2 text-sm text-gray-600">
              欢迎回来！这是您的招聘概览
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/jobs/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                发布职位
              </Button>
            </Link>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 职位统计 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                职位总数
              </CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.jobs.total || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                已发布 {stats?.jobs.published || 0} 个 · 草稿 {stats?.jobs.draft || 0} 个
              </p>
              <Link href="/jobs" className="flex items-center text-sm text-blue-600 hover:text-blue-700 mt-3">
                查看全部 <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardContent>
          </Card>

          {/* 候选人统计 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                候选人总数
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.candidates.total || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                活跃 {stats?.candidates.active || 0} · 本周新增 {stats?.candidates.newThisWeek || 0}
              </p>
              <Link href="/candidates" className="flex items-center text-sm text-green-600 hover:text-green-700 mt-3">
                查看全部 <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardContent>
          </Card>

          {/* 应聘统计 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                应聘总数
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.applications.total || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                待处理 {stats?.applications.pending || 0} · 已面试 {stats?.applications.interviewed || 0}
              </p>
              <Link href="/applications" className="flex items-center text-sm text-purple-600 hover:text-purple-700 mt-3">
                查看全部 <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardContent>
          </Card>

          {/* 面试统计 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                今日面试
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.interviews.todayCount || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                总计 {stats?.interviews.total || 0} 场 · 待进行 {stats?.interviews.scheduled || 0}
              </p>
              <Link href="/interviews" className="flex items-center text-sm text-orange-600 hover:text-orange-700 mt-3">
                查看日历 <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 趋势图表 */}
        {trendChartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                7天趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="应聘" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="面试" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="Offer" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 招聘漏斗 */}
          {funnelChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  招聘漏斗
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    整体转化率: <span className="font-bold text-green-600">{funnelData?.overallConversionRate || 0}%</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 时间周期分析 */}
          {timeCycleChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  各阶段耗时（天）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeCycleChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="平均天数" fill="#8b5cf6" />
                    <Bar dataKey="中位数" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 来源分析 */}
        {sourceChartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                候选人来源分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourceChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">来源转化率</h3>
                  {sourceChartData.map((source: any, index: number) => (
                    <div key={source.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm">{source.name}</span>
                      </div>
                      <span className="text-sm font-medium">{source.转化率}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 快捷操作 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">快捷操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">发布新职位</h3>
                    <p className="text-sm text-gray-500">创建新的职位招聘信息</p>
                  </div>
                </div>
                <Link href="/jobs/new" className="mt-4 block text-center">
                  <Button variant="secondary" className="w-full">
                    立即发布
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">添加候选人</h3>
                    <p className="text-sm text-gray-500">录入新的候选人信息</p>
                  </div>
                </div>
                <Link href="/candidates/new" className="mt-4 block text-center">
                  <Button variant="secondary" className="w-full">
                    立即添加
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">上传简历</h3>
                    <p className="text-sm text-gray-500">AI智能解析简历内容</p>
                  </div>
                </div>
                <Link href="/resume-upload" className="mt-4 block text-center">
                  <Button variant="secondary" className="w-full">
                    立即上传
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 趋势分析 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">数据概览</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                招聘漏斗
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 职位 → 应聘 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">职位 → 应聘</span>
                    <span className="text-sm text-gray-500">
                      {stats?.applications.total && stats?.jobs.published
                        ? `${((stats.applications.total / stats.jobs.published) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          stats?.applications.total && stats?.jobs.published
                            ? Math.min((stats.applications.total / stats.jobs.published) * 100, 100)
                            : 0
                        }%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    平均每个职位收到 {stats?.jobs.published ? ((stats?.applications.total || 0) / stats.jobs.published).toFixed(1) : 0} 份应聘
                  </p>
                </div>

                {/* 应聘 → 面试 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">应聘 → 面试</span>
                    <span className="text-sm text-gray-500">
                      {stats?.applications.interviewed && stats?.applications.total
                        ? `${((stats.applications.interviewed / stats.applications.total) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          stats?.applications.interviewed && stats?.applications.total
                            ? (stats.applications.interviewed / stats.applications.total) * 100
                            : 0
                        }%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.applications.interviewed || 0} 位候选人已进入面试环节
                  </p>
                </div>

                {/* 面试 → 录用 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">面试 → 录用</span>
                    <span className="text-sm text-gray-500">
                      {stats?.applications.offered && stats?.applications.interviewed
                        ? `${((stats.applications.offered / stats.applications.interviewed) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          stats?.applications.offered && stats?.applications.interviewed
                            ? (stats.applications.offered / stats.applications.interviewed) * 100
                            : 0
                        }%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.applications.offered || 0} 位候选人已收到录用通知
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
