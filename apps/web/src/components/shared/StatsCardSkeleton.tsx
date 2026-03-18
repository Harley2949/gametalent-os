'use client';

/**
 * 统计卡片骨架屏组件
 * 用于统计卡片加载时显示占位符
 */

interface StatsCardSkeletonProps {
  count?: number;
}

export function StatsCardSkeleton({ count = 4 }: StatsCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            {/* 数字和文字骨架 */}
            <div className="space-y-2 flex-1">
              <div
                className="h-8 w-20 bg-gray-200 rounded animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
              <div
                className="h-4 w-16 bg-gray-200 rounded animate-pulse"
                style={{ animationDelay: `${i * 0.1 + 0.05}s` }}
              />
            </div>

            {/* 图标骨架 */}
            <div
              className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"
              style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
