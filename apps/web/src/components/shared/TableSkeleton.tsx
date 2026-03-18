'use client';

/**
 * 表格骨架屏组件
 * 用于表格加载时显示占位符，提升用户体验
 */

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 6,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <div className="w-full bg-white rounded-lg shadow overflow-hidden">
      {/* 表头骨架 */}
      {showHeader && (
        <div className="border-b bg-gray-50">
          <div className="flex">
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={`header-${i}`}
                className="flex-1 h-12 px-4 flex items-center"
              >
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 表格行骨架 */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex hover:bg-gray-50">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="flex-1 h-16 px-4 flex items-center"
              >
                <div
                  className={`bg-gray-200 rounded animate-pulse ${
                    colIndex === 0 ? 'h-4 w-32' : 'h-4 w-20'
                  }`}
                  style={{
                    animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s`,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
