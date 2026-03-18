import { Users, TrendingUp, Briefcase } from 'lucide-react';
import Link from 'next/link';

import { ApplicationStats } from '@/types/application';

interface StatCardProps {
  type: 'total' | 'today' | 'interviewing' | 'hireRate';
  stats: ApplicationStats;
}

export function StatCard({ type, stats }: StatCardProps) {
  const cards = {
    total: {
      value: stats.total,
      label: '总应聘数',
      href: '/applications?filter=all',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      Icon: Users,
    },
    today: {
      value: stats.todayApplied,
      label: '今日新增',
      href: '/applications?filter=today',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      Icon: TrendingUp,
    },
    interviewing: {
      value: stats.byStatus?.INTERVIEWING || 0,
      label: '面试中',
      href: '/applications?status=INTERVIEWING',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      Icon: Briefcase,
    },
    hireRate: {
      value: stats.hireRate ? `${stats.hireRate}%` : '-',
      label: '录用率',
      href: '/applications?status=HIRED',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      Icon: TrendingUp,
    },
  };

  const config = cards[type];

  if (type === 'hireRate' && !stats.hireRate) {
    return (
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">-</div>
            <div className="text-sm text-gray-600 mt-1">{config.label}</div>
          </div>
          <div
            className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center opacity-50"
            style={{ cursor: 'not-allowed' }}
          >
            <config.Icon className="h-5 w-5 text-purple-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">{config.value}</div>
          <div className="text-sm text-gray-600 mt-1">{config.label}</div>
        </div>
        <Link
          href={config.href}
          className={`h-10 w-10 rounded-lg ${config.bgColor} flex items-center justify-center hover:opacity-70 transition-opacity`}
          style={{ cursor: 'pointer' }}
        >
          <config.Icon className={`h-5 w-5 ${config.iconColor}`} />
        </Link>
      </div>
    </div>
  );
}
