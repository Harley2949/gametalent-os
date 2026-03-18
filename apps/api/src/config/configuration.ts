/**
 * 配置管理模块
 *
 * 提供类型安全的配置访问
 * 确保所有环境变量都已经过验证
 */

import { registerAs } from '@nestjs/config';
import { validate, EnvironmentVariables, Environment } from './env.validation';

/**
 * 应用配置
 */
export interface AppConfig {
  nodeEnv: Environment;
  appName: string;
  appUrl: string;
  port: number;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

/**
 * 数据库配置
 */
export interface DatabaseConfig {
  url: string;
  poolSize?: number;
}

/**
 * JWT 配置
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

/**
 * 前端配置
 */
export interface FrontendConfig {
  url: string;
}

/**
 * Redis 配置
 */
export interface RedisConfig {
  url?: string;
}

/**
 * AI 配置
 */
export interface AiConfig {
  baseUrl: string;
  model: string;
}

/**
 * SMTP 配置
 */
export interface SmtpConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
}

/**
 * 日志配置
 */
export interface LoggingConfig {
  level: string;
}

/**
 * 安全配置
 */
export interface SecurityConfig {
  enableCors: boolean;
  enableRateLimit: boolean;
  rateLimitTtl: number;
  rateLimitLimit: number;
}

/**
 * 文件上传配置
 */
export interface UploadConfig {
  dir: string;
  maxFileSize: number;
}

/**
 * AWS 配置
 */
export interface AwsConfig {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  s3Bucket?: string;
}

/**
 * 注册配置到 NestJS
 */
export const configuration = () => {
  // 验证环境变量
  const validatedEnv = validate(process.env);

  return {
    // 应用配置
    app: {
      nodeEnv: validatedEnv.NODE_ENV,
      appName: validatedEnv.APP_NAME,
      appUrl: validatedEnv.APP_URL,
      port: validatedEnv.PORT,
      isDevelopment: validatedEnv.NODE_ENV === Environment.DEVELOPMENT,
      isProduction: validatedEnv.NODE_ENV === Environment.PRODUCTION,
      isTest: validatedEnv.NODE_ENV === Environment.TEST,
    } as AppConfig,

    // 数据库配置
    database: {
      url: validatedEnv.DATABASE_URL,
      poolSize: validatedEnv.DATABASE_POOL_SIZE
        ? parseInt(validatedEnv.DATABASE_POOL_SIZE, 10)
        : undefined,
    } as DatabaseConfig,

    // JWT 配置
    jwt: {
      secret: validatedEnv.JWT_SECRET,
      expiresIn: validatedEnv.JWT_EXPIRES_IN || '7d',
    } as JwtConfig,

    // 前端配置
    frontend: {
      url: validatedEnv.FRONTEND_URL,
    } as FrontendConfig,

    // Redis 配置
    redis: {
      url: validatedEnv.REDIS_URL,
    } as RedisConfig,

    // AI 配置
    ai: {
      baseUrl: validatedEnv.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: validatedEnv.OLLAMA_MODEL || 'llama2',
    } as AiConfig,

    // SMTP 配置
    smtp: {
      host: validatedEnv.SMTP_HOST,
      port: validatedEnv.SMTP_PORT,
      user: validatedEnv.SMTP_USER,
      pass: validatedEnv.SMTP_PASS,
      from: validatedEnv.EMAIL_FROM,
    } as SmtpConfig,

    // 日志配置
    logging: {
      level: validatedEnv.LOG_LEVEL,
    } as LoggingConfig,

    // 安全配置
    security: {
      enableCors: validatedEnv.ENABLE_CORS ?? true,
      enableRateLimit: validatedEnv.ENABLE_RATE_LIMIT ?? true,
      rateLimitTtl: validatedEnv.RATE_LIMIT_TTL ?? 60,
      rateLimitLimit: validatedEnv.RATE_LIMIT_LIMIT ?? 100,
    } as SecurityConfig,

    // 文件上传配置
    upload: {
      dir: validatedEnv.UPLOAD_DIR || './uploads',
      maxFileSize: validatedEnv.MAX_FILE_SIZE || 5242880, // 5MB
    } as UploadConfig,

    // AWS 配置
    aws: {
      accessKeyId: validatedEnv.AWS_ACCESS_KEY_ID,
      secretAccessKey: validatedEnv.AWS_SECRET_ACCESS_KEY,
      region: validatedEnv.AWS_REGION,
      s3Bucket: validatedEnv.AWS_S3_BUCKET,
    } as AwsConfig,
  };
};

/**
 * 配置注册工厂
 */
export const configFactory = registerAs('configuration', configuration);

/**
 * 获取配置（用于非 NestJS 上下文）
 */
export const getConfig = () => {
  return configuration();
};
