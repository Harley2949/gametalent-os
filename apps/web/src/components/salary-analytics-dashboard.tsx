'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gametalent/ui';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SalaryData {
  position: string;
  p25: number;
  p50: number;
  p75: number;
  min: number;
  max: number;
}

interface SalaryTrend {
  month: string;
  avgSalary: number;
  offerSalary: number;
  expectSalary: number;
}

interface FunnelData {
  stage: string;
  count: number;
  conversionRate: number;
}

export function SalaryAnalyticsDashboard() {
  const [position, setPosition] = useState('all');
  const [level, setLevel] = useState('all');
  const [city, setCity] = useState('all');
  const [salaryData, setSalaryData] = useState<SalaryData[]>([]);
  const [trendData, setTrendData] = useState<SalaryTrend[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [position, level, city]);

  const fetchAnalyticsData = async () => {
    const params = new URLSearchParams({
      position,
      level,
      city,
    });

    const [salaryRes, trendRes, funnelRes] = await Promise.all([
      fetch(`/api/analytics/salary?${params}`),
      fetch(`/api/analytics/salary-trend?${params}`),
      fetch(`/api/analytics/funnel?${params}`),
    ]);

    setSalaryData(await salaryRes.json());
    setTrendData(await trendRes.json());
    setFunnelData(await funnelRes.json());
  };

  const formatSalary = (value: number) => {
    return `¥${(value / 10000).toFixed(1)}万`;
  };

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="职位类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部职位</SelectItem>
                <SelectItem value="frontend">前端开发</SelectItem>
                <SelectItem value="backend">后端开发</SelectItem>
                <SelectItem value="art-3d">3D美术</SelectItem>
                <SelectItem value="art-2d">2D美术</SelectItem>
                <SelectItem value="ta">技术美术(TA)</SelectItem>
                <SelectItem value="game-design">游戏策划</SelectItem>
              </SelectContent>
            </Select>

            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="职级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部职级</SelectItem>
                <SelectItem value="junior">初级 (1-3年)</SelectItem>
                <SelectItem value="mid">中级 (3-5年)</SelectItem>
                <SelectItem value="senior">高级 (5-8年)</SelectItem>
                <SelectItem value="lead">专家/Leader (8年+)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="城市" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部城市</SelectItem>
                <SelectItem value="beijing">北京</SelectItem>
                <SelectItem value="shanghai">上海</SelectItem>
                <SelectItem value="shenzhen">深圳</SelectItem>
                <SelectItem value="hangzhou">杭州</SelectItem>
                <SelectItem value="chengdu">成都</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 薪酬分布图 */}
      <Card>
        <CardHeader>
          <CardTitle>真实成交薪酬分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="position" />
              <YAxis tickFormatter={formatSalary} />
              <Tooltip formatter={(value: number) => formatSalary(value)} />
              <Legend />
              <Bar dataKey="p25" name="P25" fill="#94a3b8" />
              <Bar dataKey="p50" name="中位数 (P50)" fill="#3b82f6" />
              <Bar dataKey="p75" name="P75" fill="#1d4ed8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 薪酬趋势图 */}
      <Card>
        <CardHeader>
          <CardTitle>薪酬趋势分析</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatSalary} />
              <Tooltip formatter={(value: number) => formatSalary(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="offerSalary"
                name="实际成交"
                stroke="#22c55e"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expectSalary"
                name="期望薪资"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 招聘漏斗 */}
      <Card>
        <CardHeader>
          <CardTitle>招聘漏斗分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData.map((stage, index) => (
              <div key={stage.stage} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <div className="flex gap-4">
                    <span className="text-gray-600">人数: {stage.count}</span>
                    <span className="text-blue-600">
                      转化率: {stage.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${stage.conversionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
