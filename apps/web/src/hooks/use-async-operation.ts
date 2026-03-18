/**
 * useAsyncOperation Hook
 * 统一的异步操作错误处理和加载状态管理
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAsyncOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

export function useAsyncOperation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 执行异步操作
   */
  const execute = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: UseAsyncOperationOptions = {}
    ): Promise<OperationResult<T>> => {
      const {
        successMessage,
        errorMessage = '操作失败',
        showSuccessToast = true,
        showErrorToast = true,
        onSuccess,
        onError,
      } = options;

      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();

        // 成功处理
        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }

        onSuccess?.(result);

        return { success: true, data: result };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        // 错误处理
        if (showErrorToast) {
          toast.error(`${errorMessage}: ${error.message}`);
        }

        onError?.(error);

        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * 包装异步函数（用于事件处理器）
   */
  const wrap = useCallback(
    <T extends any[], R>(
      operation: (...args: T) => Promise<R>,
      options: UseAsyncOperationOptions = {}
    ) => {
      return async (...args: T): Promise<OperationResult<R>> => {
        return execute(() => operation(...args), options);
      };
    },
    [execute]
  );

  return {
    isLoading,
    error,
    execute,
    wrap,
  };
}

/**
 * useMutation Hook - 简化版本，用于数据变更操作
 */
export function useMutation<T = any, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (params: P): Promise<{ success: boolean; data?: T; error?: Error }> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(params);

        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        options.onSuccess?.(result);

        return { success: true, data: result };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        const message = options.errorMessage || '操作失败';
        toast.error(`${message}: ${error.message}`);

        options.onError?.(error);

        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options]
  );

  return {
    mutate,
    isLoading,
    error,
  };
}
