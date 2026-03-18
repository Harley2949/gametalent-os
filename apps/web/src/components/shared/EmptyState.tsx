'use client';

import { Button } from '@gametalent/ui';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

/**
 * 空状态组件
 * 用于显示友好的空状态提示和引导操作
 */

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title = '暂无数据',
  description = '还没有任何记录',
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {/* 图标 */}
      {Icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {/* 标题 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* 描述 */}
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">{description}</p>

      {/* 操作按钮 */}
      {action && (
        <div className="flex justify-center gap-3">
          {action.href ? (
            <Link href={action.href}>
              <Button>{action.label}</Button>
            </Link>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}
