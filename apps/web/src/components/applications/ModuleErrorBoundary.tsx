'use client';

import { AlertOctagon, RefreshCw } from 'lucide-react';
import React from 'react';

interface Props {
  children: React.ReactNode;
  moduleName: string;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 模块级错误边界 - 隔离单个功能模块的错误
 * 当某个模块崩溃时，只显示该模块的错误，不影响其他功能
 */
export class ModuleErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 详细记录错误信息，方便调试
    console.error(`[模块错误] ${this.props.moduleName}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI - 小型、友好的错误提示
      return (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertOctagon className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900">
                {this.props.moduleName} 模块加载失败
              </h4>
              <p className="text-xs text-red-700 mt-1">
                {this.state.error?.message || '发生未知错误'}
              </p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex-shrink-0 p-2 text-red-700 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors"
              title="重试"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
