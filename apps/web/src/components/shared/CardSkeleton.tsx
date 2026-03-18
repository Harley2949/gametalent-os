'use client';

/**
 * 卡片骨架屏组件
 * 用于卡片列表加载时显示占位符
 */

interface CardSkeletonProps {
  count?: number;
  showAvatar?: boolean;
  lines?: number;
}

export function CardSkeleton({
  count = 3,
  showAvatar = true,
  lines = 3,
}: CardSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow p-6 border border-gray-200"
        >
          <div className="flex items-start gap-4">
            {/* 头像骨架 */}
            {showAvatar && (
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
              </div>
            )}

            {/* 内容骨架 */}
            <div className="flex-1 space-y-3">
              {/* 标题骨架 */}
              <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />

              {/* 文本行骨架 */}
              {Array.from({ length: lines }).map((_, j) => (
                <div
                  key={j}
                  className="h-4 bg-gray-200 rounded animate-pulse"
                  style={{
                    width: j === lines - 1 ? '60%' : '80%',
                    animationDelay: `${i * 0.1 + j * 0.05}s`,
                  }}
                />
              ))}

              {/* 标签骨架 */}
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
