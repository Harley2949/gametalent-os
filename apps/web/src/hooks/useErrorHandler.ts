/**
 * 错误处理 Hook
 * 统一处理 API 错误并显示 Toast 提示
 */

'use client';

import { useCallback } from 'react';

import { useToast } from '@/components/shared/Toast';
import {
  ApiError,
  NetworkError,
  AuthError,
  BusinessError,
  ServerError,
  TimeoutError,
} from '@/lib/errors';

/**
 * 错误消息映射
 */
const ErrorMessages: Record<string, string> = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  AUTH_ERROR: '登录已过期，请重新登录',
  BUSINESS_ERROR: '操作失败，请检查输入',
  SERVER_ERROR: '服务器错误，请稍后重试',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  NOT_FOUND: '请求的资源不存在',
};

/**
 * 获取用户友好的错误消息
 */
function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    // 如果有详细的错误消息，使用它
    if (error.message && !error.message.includes('失败')) {
      return error.message;
    }
    // 否则使用错误码映射
    return ErrorMessages[error.code || 'SERVER_ERROR'] || '操作失败，请稍后重试';
  }
  return error.message || '操作失败，请稍后重试';
}

/**
 * 错误处理 Hook
 */
export function useErrorHandler() {
  const toast = useToast();

  /**
   * 处理错误
   */
  const handleError = useCallback((error: unknown) => {
    console.error('API Error:', error);

    let message = '操作失败，请稍后重试';
    const variant: 'error' | 'warning' | 'info' = 'error';

    if (error instanceof AuthError) {
      message = '登录已过期，请重新登录';
      // 可以在这里触发重新登录逻辑
      // 例如：window.location.href = '/login';
    } else if (error instanceof NetworkError) {
      message = '网络连接失败，请检查网络设置';
    } else if (error instanceof TimeoutError) {
      message = '请求超时，请稍后重试';
    } else if (error instanceof BusinessError) {
      message = error.message || '操作失败，请检查输入';
    } else if (error instanceof ServerError) {
      message = '服务器错误，请稍后重试';
    } else if (error instanceof Error) {
      message = getErrorMessage(error);
    }

    // 显示错误提示
    toast.error(message);

    // 返回错误消息，供调用方使用
    return message;
  }, [toast]);

  /**
   * 包装异步函数，自动处理错误
   */
  const withErrorHandling = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
        successMessage?: string;
        showSuccessToast?: boolean;
      }
    ): Promise<T | null> => {
      try {
        const result = await asyncFn();

        // 成功处理
        if (options?.showSuccessToast && options?.successMessage) {
          toast.success(options.successMessage);
        }
        options?.onSuccess?.(result);

        return result;
      } catch (error) {
        const errorMessage = handleError(error);
        options?.onError?.(error as Error);
        return null;
      }
    },
    [handleError, toast]
  );

  return {
    handleError,
    withErrorHandling,
  };
}

/**
 * 简化版 Hook：用于服务端组件或非 React 环境
 */
export function getErrorMessageSafely(error: unknown): string {
  if (error instanceof Error) {
    return getErrorMessage(error);
  }
  return '操作失败，请稍后重试';
}
