'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BackButtonProps {
  /** 自定义返回路径，如果提供则直接跳转到该路径（兼容旧版属性名 fallbackHref） */
  fallbackPath?: string;
  /** @deprecated 请使用 fallbackPath，保留此属性仅为向后兼容 */
  fallbackHref?: string;
  /** 按钮文本 */
  label?: string;
  /** 是否使用固定定位（固定在页面左上角） */
  fixed?: boolean;
  /** 额外的类名 */
  className?: string;
}

/**
 * 智能返回按钮组件
 *
 * 功能：
 * - 点击后执行浏览器后退操作或跳转到指定路径
 * - 支持固定定位模式（fixed position）
 * - 支持自定义样式和文本
 *
 * 使用示例：
 * ```tsx
 * <BackButton /> // 默认样式，使用浏览器历史返回
 * <BackButton fallbackPath="/" /> // 跳转到首页
 * <BackButton fixed /> // 固定在页面左上角
 * <BackButton label="返回首页" fixed /> // 固定定位 + 自定义文本
 * ```
 */
export function BackButton({
  fallbackPath,
  fallbackHref,
  label = '返回',
  fixed = false,
  className = '',
}: BackButtonProps) {
  const router = useRouter();

  // 兼容旧版属性名
  const targetPath = fallbackPath || fallbackHref || '/';

  const handleClick = () => {
    if (targetPath) {
      // 直接跳转到指定路径
      router.push(targetPath);
    } else {
      // 使用浏览器历史返回
      router.back();
    }
  };

  // 固定定位样式
  const fixedClasses = fixed
    ? 'fixed top-4 left-4 z-50 px-3 py-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm hover:border-violet-300 hover:shadow-md'
    : '';

  // 文本标签响应式样式
  const labelClasses = fixed ? 'hidden sm:inline' : '';

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-all duration-200 group ${fixedClasses} ${className}`}
      aria-label={label}
    >
      <ArrowLeft
        size={20}
        className="group-hover:-translate-x-0.5 transition-transform duration-200"
      />
      {label && <span className={`text-base font-medium ${labelClasses}`}>{label}</span>}
    </button>
  );
}
