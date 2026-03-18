/**
 * 条件化日志工具
 * 开发环境输出详细日志，生产环境仅输出错误
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  context?: string;
  enabled?: boolean;
}

class Logger {
  private context: string;
  private isDevelopment: boolean;

  constructor(context: string, options: LoggerOptions = {}) {
    this.context = context;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    // 生产环境只记录错误和警告
    if (!this.isDevelopment) {
      return level === 'error' || level === 'warn';
    }
    return true;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const levelEmoji = {
      log: '📝',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[level];

    return `[${timestamp}] [${this.context}] ${levelEmoji} ${message}`;
  }

  log(message: string, ...args: unknown[]): void {
    if (this.shouldLog('log')) {
      console.log(this.formatMessage('log', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    // 错误始终记录
    console.error(this.formatMessage('error', message), ...args);
  }

  /**
   * 创建子日志记录器
   */
  child(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`);
  }
}

/**
 * 创建日志记录器工厂
 */
export function createLogger(context: string, options?: LoggerOptions): Logger {
  return new Logger(context, options);
}

/**
 * 预创建的日志记录器
 */
export const authLogger = createLogger('Auth');
export const apiLogger = createLogger('API');
export const uiLogger = createLogger('UI');
