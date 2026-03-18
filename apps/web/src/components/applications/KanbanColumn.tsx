import { Card, CardContent } from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { Inbox, Clock, Building2, GripVertical, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

import { Application, ApplicationStatus, KanbanColumns } from '@/types/application';

interface KanbanColumnProps {
  status: string;
  label: string;
  color: string;
  applications: Application[];
  isDragOver: boolean;
  updatingId: string | null;
  draggedId: string | null;
  onDragOver: (e: React.DragEvent, status: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: ApplicationStatus) => void;
  onDragStart: (e: React.DragEvent, application: Application) => void;
  onDragEnd: () => void;
  getCandidateName: (id: string) => string;
  getJobTitle: (id: string) => string;
}

export const KanbanColumn = memo(function KanbanColumn({
  status,
  label,
  color,
  applications,
  isDragOver,
  updatingId,
  draggedId,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  getCandidateName,
  getJobTitle,
}: KanbanColumnProps) {
  const router = useRouter();

  const hasUpdatingCard = applications.some((app) => updatingId === app.id);

  return (
    <div
      data-column-status={status}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status as ApplicationStatus)}
      className={`
        w-full ${color} rounded-lg p-4 h-[600px] flex flex-col
        transition-all duration-300 ease-out
        ${isDragOver
          ? 'ring-4 ring-blue-400 ring-opacity-60 scale-105 shadow-2xl bg-opacity-80'
          : ''
        }
      `}
    >
      {/* 列标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{label}</h3>
          {isDragOver && (
            <span className="text-xs text-blue-600 animate-pulse">放开以放置</span>
          )}
        </div>
        <Badge
          variant="secondary"
          className={isDragOver ? 'animate-bounce' : ''}
        >
          {applications.length}
        </Badge>
      </div>

      {/* 卡片容器 */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {applications.map((application) => {
          const isDragging = draggedId === application.id;
          const isUpdating = updatingId === application.id;

          return (
            <Card
              key={application.id}
              data-application-id={application.id}
              draggable
              onDragStart={(e) => onDragStart(e, application)}
              onDragEnd={onDragEnd}
              onClick={(e) => {
                if (!isDragging) {
                  router.push(`/applications/${application.id}`);
                }
              }}
              className={`
                cursor-grab active:cursor-grabbing
                transition-all duration-200 ease-out
                ${isDragging
                  ? 'opacity-40 scale-90 rotate-3 shadow-2xl'
                  : 'hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1'
                }
                ${isUpdating ? 'pointer-events-none opacity-50' : ''}
                ${isDragOver && !isDragging ? 'opacity-80' : ''}
              `}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* 拖拽手柄 */}
                  <div className="flex-shrink-0 mt-1">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>

                  {/* 卡片内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                          {getCandidateName(application.candidateId)}
                        </h4>
                        <p className="text-xs text-gray-600 truncate">
                          应聘：{getJobTitle(application.jobId)}
                        </p>
                      </div>
                      {isUpdating && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    {application.candidate?.currentCompany && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                        <Building2 className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{application.candidate.currentCompany}</span>
                      </div>
                    )}

                    {application.matchScore && (
                      <div className="mb-2">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
                        >
                          匹配度 {application.matchScore}%
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span>
                        {new Date(application.appliedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* 空状态提示 */}
        {applications.length === 0 && (
          <div
            className={`
              text-center py-12 rounded-lg border-2 transition-all duration-300
              ${isDragOver
                ? 'border-blue-400 bg-blue-50 text-blue-600 scale-105'
                : 'border-dashed border-gray-300 text-gray-400'
              }
            `}
          >
            {isDragOver ? (
              <div className="space-y-2">
                <Inbox className="h-8 w-8 mx-auto text-blue-500 animate-bounce" />
                <p className="text-sm font-medium">放开以放置</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Inbox className="h-8 w-8 mx-auto opacity-50" />
                <p className="text-sm">暂无应聘记录</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
