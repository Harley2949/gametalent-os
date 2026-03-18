/**
 * API 请求拦截器
 * 统一处理请求头、认证、错误响应等
 */

import { createApiError, ApiError, NetworkError, TimeoutError } from './errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
const DEFAULT_TIMEOUT = 30000; // 30秒

/**
 * 请求配置接口
 */
export interface FetchConfig extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
  skipErrorToast?: boolean;
  fallbackToMock?: boolean;
}

/**
 * 获取认证头
 */
function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const token = localStorage.getItem('auth_token');
  if (!token) return {};

  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * 统一的 fetch 客户端
 */
export async function fetchClient<T = any>(
  endpoint: string,
  config: FetchConfig = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    skipAuth = false,
    headers = {},
    ...restConfig
  } = config;

  // 构建完整 URL
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  // 构建请求头
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> || {}),
  };

  // 添加认证头（除非明确跳过）
  if (!skipAuth) {
    Object.assign(requestHeaders, getAuthHeaders());
  }

  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...restConfig,
      headers: requestHeaders,
      signal: controller.signal,
    });

    // 清除超时定时器
    clearTimeout(timeoutId);

    // 处理非 OK 响应
    if (!response.ok) {
      await handleErrorResponse(response);
    }

    // 解析响应
    const data = await response.json();
    return data;

  } catch (error: any) {
    // 清除超时定时器
    clearTimeout(timeoutId);

    // 处理不同类型的错误
    if (error.name === 'AbortError') {
      throw new TimeoutError();
    }

    if (error instanceof ApiError) {
      throw error;
    }

    // 网络错误
    if (error instanceof TypeError) {
      throw new NetworkError();
    }

    // 未知错误
    throw new ApiError(error.message || '未知错误');
  }
}

/**
 * 处理错误响应
 */
async function handleErrorResponse(response: Response): Promise<never> {
  let errorMessage = '请求失败';
  let errorDetails: any;

  // 尝试解析错误信息
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
    errorDetails = errorData;
  } catch {
    // 解析失败，使用默认错误信息
    errorMessage = response.statusText || errorMessage;
  }

  // 处理特定状态码
  switch (response.status) {
    case 401:
      // 清除过期的 token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      // 可以在这里触发重新登录逻辑
      break;

    case 403:
      errorMessage = '没有权限执行此操作';
      break;
  }

  // 创建并抛出对应的错误
  const error = createApiError(response.status, errorMessage, errorDetails);
  throw error;
}

/**
 * GET 请求快捷方法
 */
export function get<T = any>(
  endpoint: string,
  config: Omit<FetchConfig, 'method' | 'body'> = {}
): Promise<T> {
  return fetchClient<T>(endpoint, { ...config, method: 'GET' });
}

/**
 * POST 请求快捷方法
 */
export function post<T = any>(
  endpoint: string,
  data?: any,
  config: Omit<FetchConfig, 'method'> = {}
): Promise<T> {
  return fetchClient<T>(endpoint, {
    ...config,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT 请求快捷方法
 */
export function put<T = any>(
  endpoint: string,
  data?: any,
  config: Omit<FetchConfig, 'method'> = {}
): Promise<T> {
  return fetchClient<T>(endpoint, {
    ...config,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH 请求快捷方法
 */
export function patch<T = any>(
  endpoint: string,
  data?: any,
  config: Omit<FetchConfig, 'method'> = {}
): Promise<T> {
  return fetchClient<T>(endpoint, {
    ...config,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 请求快捷方法
 */
export function del<T = any>(
  endpoint: string,
  config: Omit<FetchConfig, 'method' | 'body'> = {}
): Promise<T> {
  return fetchClient<T>(endpoint, { ...config, method: 'DELETE' });
}

/**
 * 文件上传
 */
export function upload<T = any>(
  endpoint: string,
  file: File,
  config: Omit<FetchConfig, 'method' | 'headers'> = {}
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  return fetchClient<T>(endpoint, {
    ...config,
    method: 'POST',
    body: formData,
    headers: {
      // 不设置 Content-Type，让浏览器自动设置
      ...(config as FetchConfig).headers,
    },
  });
}
