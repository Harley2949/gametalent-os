/**
 * 统一错误类型定义
 */

/**
 * API 错误基类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 网络错误（连接失败、超时等）
 */
export class NetworkError extends ApiError {
  constructor(message: string = '网络连接失败，请检查网络设置') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * 认证错误（401、403）
 */
export class AuthError extends ApiError {
  constructor(message: string = '登录已过期，请重新登录') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

/**
 * 业务逻辑错误（400、422）
 */
export class BusinessError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'BUSINESS_ERROR', details);
    this.name = 'BusinessError';
  }
}

/**
 * 服务器错误（500、502、503）
 */
export class ServerError extends ApiError {
  constructor(message: string = '服务器错误，请稍后重试') {
    super(message, 500, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

/**
 * 未找到错误（404）
 */
export class NotFoundError extends ApiError {
  constructor(message: string = '请求的资源不存在') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * 请求超时错误
 */
export class TimeoutError extends ApiError {
  constructor(message: string = '请求超时，请稍后重试') {
    super(message, 408, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

/**
 * 错误类型映射
 */
const ErrorMap: Record<number, new (message: string, details?: any) => ApiError> = {
  0: NetworkError,
  401: AuthError,
  403: AuthError,
  404: NotFoundError,
  400: BusinessError,
  422: BusinessError,
  500: ServerError,
  502: ServerError,
  503: ServerError,
  408: TimeoutError,
};

/**
 * 根据 HTTP 状态码创建对应的错误对象
 */
export function createApiError(
  statusCode: number,
  message?: string,
  _details?: any
): ApiError {
  const ErrorClass = ErrorMap[statusCode] || ServerError;
  return new ErrorClass(message || getDefaultErrorMessage(statusCode));
}

function getDefaultErrorMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权，请重新登录',
    403: '拒绝访问',
    404: '请求的资源不存在',
    422: '业务逻辑错误',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    408: '请求超时',
  };
  return messages[statusCode] || '未知错误';
}

/**
 * 错误代码枚举（与后端保持一致）
 */
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * API 错误响应接口
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    statusCode: number;
  };
}

/**
 * 用户友好的错误消息映射
 */
const USER_FRIENDLY_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: '您还未登录，请先登录',
  [ErrorCode.INVALID_CREDENTIALS]: '邮箱或密码错误',
  [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCode.TOKEN_INVALID]: '登录信息无效，请重新登录',
  [ErrorCode.FORBIDDEN]: '您没有权限执行此操作',
  [ErrorCode.VALIDATION_ERROR]: '请检查输入信息是否正确',
  [ErrorCode.NOT_FOUND]: '请求的资源不存在',
  [ErrorCode.ALREADY_EXISTS]: '该资源已存在',
  [ErrorCode.BUSINESS_RULE_VIOLATION]: '此操作不符合业务规则',
  [ErrorCode.INTERNAL_SERVER_ERROR]: '服务器出现错误，请稍后再试',
  [ErrorCode.SERVICE_UNAVAILABLE]: '服务暂时不可用，请稍后再试',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: '操作过于频繁，请稍后再试',
};

/**
 * 获取用户友好的错误消息
 */
export function getUserFriendlyMessage(error: ApiError | Error | unknown): string {
  if (error instanceof ApiError) {
    if (error.code && USER_FRIENDLY_MESSAGES[error.code as ErrorCode]) {
      return USER_FRIENDLY_MESSAGES[error.code as ErrorCode];
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '发生了未知错误';
}

/**
 * 处理 API 错误响应
 */
export async function handleApiErrorResponse(
  response: Response
): Promise<never> {
  let errorData: ApiErrorResponse;

  try {
    errorData = await response.json();
  } catch {
    // 无法解析 JSON，使用默认错误
    throw new ServerError('服务器响应格式错误');
  }

  // 提取错误信息
  const apiError = new ApiError(
    errorData.error.message,
    errorData.error.statusCode,
    errorData.error.code,
    errorData.error.details
  );

  // 处理 401 错误：跳转到登录页
  if (errorData.error.statusCode === 401) {
    if (typeof window !== 'undefined') {
      // 清除 token
      localStorage.removeItem('token');
      // 跳转到登录页，保存当前路径用于登录后跳转
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }

  throw apiError;
}

/**
 * 带错误处理的 fetch 包装函数
 */
export async function safeFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      await handleApiErrorResponse(response);
    }

    return response;
  } catch (error) {
    // 网络错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError();
    }
    throw error;
  }
}

/**
 * Toast 错误提示辅助函数
 */
export function showErrorToast(error: unknown, showToast?: (message: string) => void): void {
  const message = getUserFriendlyMessage(error);
  showToast?.(message);
}

/**
 * 表单验证错误处理
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * 从 API 错误响应中提取字段错误
 */
export function extractFieldErrors(error: ApiError): Record<string, string> | null {
  if (error.details?.errors) {
    const errors: Record<string, string> = {};

    Object.entries(error.details.errors).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        errors[field] = messages[0]; // 取第一个错误消息
      } else if (typeof messages === 'string') {
        errors[field] = messages;
      }
    });

    return errors;
  }

  return null;
}
