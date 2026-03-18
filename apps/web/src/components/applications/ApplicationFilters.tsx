'use client';

import { useState, useCallback } from 'react';
import { Button } from '@gametalent/ui';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Badge } from '@gametalent/ui';
import { ApplicationStatusLabels } from '@/types/application';
import { ModuleErrorBoundary } from './ModuleErrorBoundary';
import { isFeatureEnabled } from '@/lib/featureFlags';

interface ApplicationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  jobFilter: string;
  onJobFilterChange: (value: string) => void;
  viewMode: 'list' | 'kanban';
  onViewModeChange: (mode: 'list' | 'kanban') => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  jobs: Array<{ id: string; title: string }>;
}

/**
 * 搜索和筛选模块 - 独立的功能模块
 * 如果此模块崩溃，不会影响其他功能
 */
export function ApplicationFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  jobFilter,
  onJobFilterChange,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onClearFilters,
  jobs,
}: ApplicationFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
    onSearchChange(value);
  }, [onSearchChange]);

  return (
    <ModuleErrorBoundary moduleName="搜索和筛选">
      <div className="mb-6 space-y-4">
        {/* 搜索框 */}
        {isFeatureEnabled('SEARCH') && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索候选人姓名、邮箱、公司..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
            />
          </div>
        )}

        {/* 筛选器 */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">筛选：</span>

          {/* 状态筛选 */}
          {isFeatureEnabled('STATUS_FILTER') && (
            <select
              value={statusFilter || ''}
              onChange={(e) => onStatusFilterChange(e.target.value || 'all')}
              className="h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">所有状态</option>
              {Object.entries(ApplicationStatusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          )}

          {/* 职位筛选 */}
          {isFeatureEnabled('JOB_FILTER') && jobs.length > 0 && (
            <select
              value={jobFilter || ''}
              onChange={(e) => onJobFilterChange(e.target.value || 'all')}
              className="h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">所有职位</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          )}

          {/* 视图切换按钮 */}
          {isFeatureEnabled('VIEW_SWITCHER') && (
            <div className="flex gap-2 ml-auto">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => onViewModeChange('kanban')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => onViewModeChange('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* 清除筛选 */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-9 px-3"
            >
              清除筛选
            </Button>
          )}
        </div>
      </div>
    </ModuleErrorBoundary>
  );
}
