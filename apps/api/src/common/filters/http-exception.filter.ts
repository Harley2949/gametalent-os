import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 🔒 敏感信息过滤器
 * 防止密码、密钥、数据库信息等敏感数据泄露到错误消息中
 */
class SensitiveDataFilter {
  /**
   * 敏感信息关键词列表
   */
  private static readonly SENSITIVE_KEYWORDS = [
    'password',
    'passwd',
    'secret',
    'token',
    'key',
    'authorization',
    'cookie',
    'session',
    'jwt',
    'database',
    'connection',
    'private',
    'credential',
  ];

  /**
   * 从消息中过滤敏感信息
   */
  static filter(message: string): string {
    if (!message || typeof message !== 'string') {
      return message;
    }

    let filtered = message;

    // 移除常见的敏感信息模式
    // 例如: password=xxx, password: xxx, "password": "xxx"
    filtered = filtered.replace(
      /(["']?)(password|passwd|secret|token|key|authorization|cookie|session|jwt|database|connection|credential)\s*[=:]\s*(["']?)([^"'\s,)}]+)/gi,
      '$1$2$3***$4'
    );

    // 移除数据库连接字符串中的敏感信息
    // postgresql://user:password@host:port/database
    filtered = filtered.replace(
      /(postgresql|mysql|mongodb|mssql|redis):\/\/([^:]+):([^@]+)@/gi,
      '$1://$1:***@'
    );

    // 移除 Bearer token
    filtered = filtered.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer ***');

    return filtered;
  }

  /**
   * 从对象中递归过滤敏感信息
   */
  static filterObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.filterObject(item));
    }

    const filtered: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // 检查是否是敏感字段
      const isSensitive = this.SENSITIVE_KEYWORDS.some(keyword =>
        lowerKey.includes(keyword)
      );

      if (isSensitive) {
        filtered[key] = '***';
      } else if (typeof value === 'string') {
        filtered[key] = this.filter(value);
      } else if (typeof value === 'object' && value !== null) {
        filtered[key] = this.filterObject(value);
      } else {
        filtered[key] = value;
      }
    }

    return filtered;
  }
}

/**
 * 全局异常过滤器
 * 🔒 安全改进：过滤敏感信息，防止数据泄露
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: '服务器内部错误', error: 'Internal Server Error' };

    // 🔒 安全改进：过滤敏感信息
    let safeMessage: any;
    if (typeof rawMessage === 'string') {
      safeMessage = { message: SensitiveDataFilter.filter(rawMessage) };
    } else {
      safeMessage = SensitiveDataFilter.filterObject(rawMessage);
    }

    // 🔒 安全改进：开发环境记录完整错误，生产环境过滤堆栈信息
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      // 开发环境：记录完整错误（包括堆栈）
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      // 生产环境：记录过滤后的错误（不包括堆栈）
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${JSON.stringify(safeMessage)}`
      );
    }

    // 🔒 安全改进：不返回详细的错误堆栈
    // 返回友好的错误响应（确保 UTF-8 编码）
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...safeMessage,
      // 仅在开发环境返回错误详情
      ...(isDevelopment && { debug: safeMessage }),
    });
  }
}
