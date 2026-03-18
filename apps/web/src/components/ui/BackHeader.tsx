"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackHeaderProps {
  /**
   * 页面标题（可选）
   * 会显示在返回按钮旁边或居中位置
   */
  title?: string;
  /**
   * 右侧操作按钮（可选）
   * 例如：保存按钮、编辑按钮等
   */
  children?: React.ReactNode;
  /**
   * 返回路径（可选）
   * 如果不提供，则使用 router.back()
   */
  fallbackHref?: string;
  /**
   * 是否隐藏返回按钮（默认 false）
   */
  hideBackButton?: boolean;
  /**
   * 自定义返回文字（默认"返回"）
   */
  backText?: string;
}

/**
 * 统一的页面头部组件
 * 包含返回按钮、页面标题和操作按钮
 *
 * @example
 * // 基础用法 - 只有返回按钮
 * <BackHeader />
 *
 * // 带标题
 * <BackHeader title="编辑候选人" />
 *
 * // 带标题和操作按钮
 * <BackHeader title="编辑候选人">
 *   <Button>保存</Button>
 * </BackHeader>
 *
 * // 指定返回路径
 * <BackHeader title="编辑候选人" fallbackHref="/candidates" />
 */
export function BackHeader({
  title,
  children,
  fallbackHref,
  hideBackButton = false,
  backText = "返回",
}: BackHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (fallbackHref) {
      router.push(fallbackHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      {/* 左侧：返回按钮 + 标题 */}
      <div className="flex items-center gap-4">
        {!hideBackButton && (
          <button
            onClick={handleBack}
            className="group flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
            {backText}
          </button>
        )}

        {title && (
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        )}
      </div>

      {/* 右侧：操作按钮 */}
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export default BackHeader;
