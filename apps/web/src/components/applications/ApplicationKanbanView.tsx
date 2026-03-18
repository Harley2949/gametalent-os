import { memo } from 'react';

import { KanbanColumn } from './KanbanColumn';

import { Application, ApplicationStatus, KanbanColumns } from '@/types/application';

interface ApplicationKanbanViewProps {
  kanbanData: Record<string, Application[]>;
  dragOverStatus: string | null;
  updatingStatus: string | null;
  draggedApplication: Application | null;
  onDragOver: (e: React.DragEvent, status: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: ApplicationStatus) => void;
  onDragStart: (e: React.DragEvent, application: Application) => void;
  onDragEnd: () => void;
  getCandidateName: (id: string) => string;
  getJobTitle: (id: string) => string;
}

export const ApplicationKanbanView = memo(function ApplicationKanbanView({
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
  getJobTitle,
}: ApplicationKanbanViewProps) {
  return (
    <div className="grid grid-cols-4 gap-4 w-full">
      {KanbanColumns.map((column) => {
        const columnApplications = kanbanData[column.status] || [];
        const isDragOver = dragOverStatus === column.status;

        return (
          <KanbanColumn
            key={column.status}
            status={column.status}
            label={column.label}
            color={column.color}
            applications={columnApplications}
            isDragOver={isDragOver}
            updatingId={updatingStatus}
            draggedId={draggedApplication?.id || null}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            getCandidateName={getCandidateName}
            getJobTitle={getJobTitle}
          />
        );
      })}
    </div>
  );
});
