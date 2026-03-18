'use client';

import { DragEvent } from 'react';

import { ApplicationKanbanView } from './ApplicationKanbanView';
import { ApplicationListView } from './ApplicationListView';
import { ModuleErrorBoundary } from './ModuleErrorBoundary';

import { isFeatureEnabled } from '@/lib/featureFlags';
import { Application, ApplicationStatus } from '@/types/application';


interface ApplicationContentProps {
  viewMode: 'list' | 'kanban';
  applications: Application[];
  kanbanData: Record<string, Application[]>;
  dragOverStatus: string | null;
  updatingStatus: string | null;
  draggedApplication: Application | null;
  onDragOver: (e: DragEvent, status: string) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent, status: ApplicationStatus) => void;
  onDragStart: (e: DragEvent, application: Application) => void;
  onDragEnd: () => void;
  getCandidateName: (id: string) => string;
  getCandidateCompany: (id: string) => string;
  getJobTitle: (id: string) => string;
}

/**
 * 内容视图模块 - 独立的功能模块
 * 包含看板视图和列表视图
 * 如果此模块崩溃，不会影响搜索、筛选等其他功能
 */
export function ApplicationContent({
  viewMode,
  applications,
  kanbanData,
  dragOverStatus,
  updatingStatus,
  draggedApplication,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  getCandidateName,
  getCandidateCompany,
  getJobTitle,
}: ApplicationContentProps) {
  return (
    <ModuleErrorBoundary moduleName="内容视图">
      <div className="min-h-[400px]">
        {viewMode === 'list' && isFeatureEnabled('LIST_VIEW') ? (
          <ApplicationListView
            applications={applications}
            getCandidateName={getCandidateName}
            getCandidateCompany={getCandidateCompany}
            getJobTitle={getJobTitle}
          />
        ) : viewMode === 'kanban' && isFeatureEnabled('KANBAN_VIEW') ? (
          <ApplicationKanbanView
            kanbanData={kanbanData}
            dragOverStatus={dragOverStatus}
            updatingStatus={updatingStatus}
            draggedApplication={draggedApplication}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            getCandidateName={getCandidateName}
            getJobTitle={getJobTitle}
          />
        ) : null}
      </div>
    </ModuleErrorBoundary>
  );
}
