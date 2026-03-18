/**
 * 全局异常过滤器
 *
 * 捕获所有应用错误，统一格式化响应
 * 记录错误日志，隐藏敏感信息
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppError, ErrorCode } from '../errors/app.error';

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    statusCode: number;
  };
  stack?: string; // 仅开发环境包含
}

/**
 * 全局异常过滤器
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 判断环境
    const isDevelopment = process.env.NODE_ENV === 'development';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = ErrorCode.INTERNAL_SERVER_ERROR;
    let details: any = undefined;
    let stack: string | undefined = undefined;

    // 处理 AppError
    if (exception instanceof AppError) {
      statusCode = exception.statusCode;
      message = exception.message;
      code = exception.code;
      details = exception.details;
      stack = exception.stack;

      // 记录错误日志
      this.logError(exception, request);
    }
    // 处理 HttpException
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        details = responseObj.errors || responseObj.details;
      }

      code = this.getErrorCodeFromStatus(statusCode);
      stack = exception.stack;

      this.logError(exception, request);
    }
    // 处理未知错误
    else {
      message = '服务器内部错误';
      code = ErrorCode.INTERNAL_SERVER_ERROR;

      if (exception instanceof Error) {
        if (isDevelopment) {
          message = exception.message;
        }
        stack = exception.stack;
      }

      // 记录未知错误
      this.logger.error(
        `未处理的异常: ${message}`,
        exception instanceof Error ? exception.stack : '',
      );
    }

    // 构建错误响应
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
        path: request.url,
        statusCode,
      },
      ...(isDevelopment && stack && { stack }),
    };

    // 记录响应（仅错误）
    if (statusCode >= 400) {
      this.logger.error(
        `${request.method} ${request.url} → ${statusCode} ${code}`,
        JSON.stringify(errorResponse.error),
      );
    }

    // 发送响应
    response.status(statusCode).json(errorResponse);
  }

  /**
   * 根据状态码获取错误代码
   */
  private getErrorCodeFromStatus(status: number): ErrorCode {
    switch (status) {
      case 400:
        return ErrorCode.INVALID_INPUT;
      case 401:
        return ErrorCode.UNAUTHORIZED;
      case 403:
        return ErrorCode.FORBIDDEN;
      case 404:
        return ErrorCode.NOT_FOUND;
      case 409:
        return ErrorCode.RESOURCE_CONFLICT;
      case 422:
        return ErrorCode.VALIDATION_ERROR;
      case 429:
        return ErrorCode.RATE_LIMIT_EXCEEDED;
      case 500:
        return ErrorCode.INTERNAL_SERVER_ERROR;
      case 503:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * 记录错误日志
   */
  private logError(exception: AppError | HttpException, request: Request) {
    const statusCode =
      exception instanceof AppError
        ? exception.statusCode
        : exception.getStatus();

    // 只记录 5xx 错误和 4xx 错误（4xx 用 warn，5xx 用 error）
    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof AppError
          ? exception.stack
          : exception.stack,
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} → ${statusCode}`,
      );
    }
  }
}

/**
 * HTTP 异常过滤器（仅处理 HttpException）
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = '请求错误';
    let details: any = undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || message;
      details = responseObj.errors || responseObj.details;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: this.getErrorCodeFromStatus(status),
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
        path: request.url,
        statusCode: status,
      },
    };

    // 记录日志
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception.stack,
      );
    } else if (status >= 400) {
      this.logger.warn(`${request.method} ${request.url} → ${status}`);
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): ErrorCode {
    const codeMap: Record<number, ErrorCode> = {
      400: ErrorCode.INVALID_INPUT,
      401: ErrorCode.UNAUTHORIZED,
      403: ErrorCode.FORBIDDEN,
      404: ErrorCode.NOT_FOUND,
      409: ErrorCode.RESOURCE_CONFLICT,
      422: ErrorCode.VALIDATION_ERROR,
      429: ErrorCode.RATE_LIMIT_EXCEEDED,
      500: ErrorCode.INTERNAL_SERVER_ERROR,
      503: ErrorCode.SERVICE_UNAVAILABLE,
    };
    return codeMap[status] || ErrorCode.INTERNAL_SERVER_ERROR;
  }
}
