/**
 * 🔒 生产环境日志工具
 *
 * 功能：
 * - 开发环境：完整日志输出
 * - 生产环境：仅输出 error 和 warn
 * - 支持日志级别过滤
 * - 支持日志格式化
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isProduction: boolean;
  private isDevelopment: boolean;
  private enableDebug: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.enableDebug = process.env.ENABLE_DEBUG_LOGS === 'true';
  }

  /**
   * 格式化日志前缀
   */
  private formatPrefix(level: LogLevel, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : '';
    return `${timestamp} ${contextStr}`;
  }

  /**
   * 普通日志 - 生产环境禁用
   */
  log(...args: any[]): void {
    if (!this.isProduction) {
      console.log(...args);
    }
  }

  /**
   * 信息日志 - 生产环境禁用
   */
  info(message: string, context?: string): void {
    if (!this.isProduction) {
      const prefix = this.formatPrefix('info', context);
      console.info(`${prefix}${message}`);
    }
  }

  /**
   * 调试日志 - 仅在 DEBUG 模式启用
   */
  debug(message: string, context?: string): void {
    if (this.enableDebug && !this.isProduction) {
      const prefix = this.formatPrefix('debug', context);
      console.debug(`${prefix}${message}`);
    }
  }

  /**
   * 警告日志 - 始终启用
   */
  warn(message: string, context?: string): void {
    const prefix = this.formatPrefix('warn', context);
    console.warn(`${prefix}${message}`);
  }

  /**
   * 错误日志 - 始终启用
   */
  error(message: string, error?: Error | unknown, context?: string): void {
    const prefix = this.formatPrefix('error', context);

    if (error instanceof Error) {
      console.error(`${prefix}${message}`, error.message);
      if (this.isDevelopment && error.stack) {
        console.error(error.stack);
      }
    } else {
      console.error(`${prefix}${message}`, error);
    }
  }

  /**
   * 性能测量日志
   */
  time(label: string): void {
    if (!this.isProduction) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (!this.isProduction) {
      console.timeEnd(label);
    }
  }

  /**
   * 表格日志 - 仅开发环境
   */
  table(data: any[]): void {
    if (!this.isProduction) {
      console.table(data);
    }
  }
}

// 导出单例
export const logger = new Logger();

// 便捷导出
export const log = (...args: any[]) => logger.log(...args);
export const info = (message: string, context?: string) => logger.info(message, context);
export const debug = (message: string, context?: string) => logger.debug(message, context);
export const warn = (message: string, context?: string) => logger.warn(message, context);
export const error = (message: string, err?: Error | unknown, context?: string) =>
  logger.error(message, err, context);
