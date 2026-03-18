/**
 * 应用错误基类
 *
 * 统一的应用错误类型，提供结构化的错误信息
 */

export enum ErrorCode {
  // 认证错误 (1xxx)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',

  // 权限错误 (2xxx)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // 验证错误 (3xxx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // 资源错误 (4xxx)
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',

  // 业务逻辑错误 (5xxx)
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',

  // 外部服务错误 (6xxx)
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  EMAIL_SERVICE_ERROR = 'EMAIL_SERVICE_ERROR',

  // 系统错误 (9xxx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export interface ErrorDetails {
  field?: string;
  value?: any;
  constraints?: Record<string, string>;
  [key: string]: any;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ErrorDetails;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly path?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: ErrorDetails,
  ) {
    super(message);

    // 维护正确的堆栈跟踪（仅在 V8 引擎中）
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // 设置 HTTP 状态码
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * 转换为 JSON 响应格式
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      ...(this.path && { path: this.path }),
    };
  }

  /**
   * 静态工厂方法：创建 400 错误
   */
  static badRequest(message: string, details?: ErrorDetails): AppError {
    return new AppError(message, 400, ErrorCode.INVALID_INPUT, true, details);
  }

  /**
   * 静态工厂方法：创建 401 错误
   */
  static unauthorized(message: string = '未授权访问', details?: ErrorDetails): AppError {
    return new AppError(message, 401, ErrorCode.UNAUTHORIZED, true, details);
  }

  /**
   * 静态工厂方法：创建 403 错误
   */
  static forbidden(message: string = '无权访问', details?: ErrorDetails): AppError {
    return new AppError(message, 403, ErrorCode.FORBIDDEN, true, details);
  }

  /**
   * 静态工厂方法：创建 404 错误
   */
  static notFound(resource: string = '资源', details?: ErrorDetails): AppError {
    return new AppError(
      `${resource}不存在`,
      404,
      ErrorCode.NOT_FOUND,
      true,
      details,
    );
  }

  /**
   * 静态工厂方法：创建 409 冲突错误
   */
  static conflict(message: string, details?: ErrorDetails): AppError {
    return new AppError(message, 409, ErrorCode.RESOURCE_CONFLICT, true, details);
  }

  /**
   * 静态工厂方法：创建 422 验证错误
   */
  static validation(message: string, details?: ErrorDetails): AppError {
    return new AppError(message, 422, ErrorCode.VALIDATION_ERROR, true, details);
  }

  /**
   * 静态工厂方法：创建 429 限流错误
   */
  static rateLimit(message: string = '请求过于频繁，请稍后再试'): AppError {
    return new AppError(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED, true);
  }

  /**
   * 静态工厂方法：创建 500 服务器错误
   */
  static internal(message: string = '服务器内部错误', details?: ErrorDetails): AppError {
    return new AppError(message, 500, ErrorCode.INTERNAL_SERVER_ERROR, false, details);
  }

  /**
   * 静态工厂方法：创建 503 服务不可用错误
   */
  static serviceUnavailable(message: string = '服务暂时不可用'): AppError {
    return new AppError(message, 503, ErrorCode.SERVICE_UNAVAILABLE, false);
  }
}

/**
 * 业务逻辑错误
 */
export class BusinessRuleError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(
      message,
      400,
      ErrorCode.BUSINESS_RULE_VIOLATION,
      true,
      details,
    );
  }
}

/**
 * 状态转换错误
 */
export class StateTransitionError extends AppError {
  constructor(
    message: string,
    public readonly currentState: string,
    public readonly targetState: string,
    details?: ErrorDetails,
  ) {
    super(message, 400, ErrorCode.INVALID_STATE_TRANSITION, true, {
      ...details,
      currentState,
      targetState,
    });
  }
}
