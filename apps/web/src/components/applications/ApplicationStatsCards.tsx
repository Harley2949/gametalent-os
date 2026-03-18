'use client';

import { ModuleErrorBoundary } from './ModuleErrorBoundary';
import { StatCard } from './StatCard';

import { ApplicationStats } from '@/types/application';

interface ApplicationStatsCardsProps {
  stats: ApplicationStats;
}

/**
 * 统计卡片模块 - 独立的功能模块
 * 如果此模块崩溃，不会影响其他功能
 */
export function ApplicationStatsCards({ stats }: ApplicationStatsCardsProps) {
  return (
    <ModuleErrorBoundary moduleName="统计卡片">
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard type="total" stats={stats} />
          <StatCard type="today" stats={stats} />
          <StatCard type="interviewing" stats={stats} />
          <StatCard type="hireRate" stats={stats} />
        </div>
      </div>
    </ModuleErrorBoundary>
  );
}
