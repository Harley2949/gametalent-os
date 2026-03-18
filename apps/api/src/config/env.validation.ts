/**
 * 环境变量验证模式
 *
 * 使用 class-validator 和 class-transformer 验证所有环境变量
 * 确保应用启动前所有必需的配置都已正确设置
 */

import { IsString, IsInt, IsBoolean, IsOptional, IsEnum, IsUrl, Min, Max, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export class EnvironmentVariables {
  // ============================================
  // 应用基础配置
  // ============================================

  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  APP_NAME: string;

  @IsUrl({ require_tld: false })
  APP_URL: string;

  @IsInt()
  @Min(1000)
  @Max(65535)
  PORT: number;

  // ============================================
  // 数据库配置
  // ============================================

  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  DATABASE_POOL_SIZE?: string;

  // ============================================
  // JWT 认证配置
  // 安全要求：
  // - 开发环境：至少 32 字符
  // - 生产环境：至少 64 字符，使用强随机生成
  // ============================================

  @IsString()
  @Min(32) // JWT_SECRET 必须至少 32 字符
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN?: string = '7d';

  // ============================================
  // 前端配置
  // ============================================

  @IsUrl({ require_tld: false })
  FRONTEND_URL: string;

  // ============================================
  // Redis 配置
  // ============================================

  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  // ============================================
  // AI / Ollama 配置
  // ============================================

  @IsOptional()
  @IsUrl({ require_tld: false })
  OLLAMA_BASE_URL?: string = 'http://localhost:11434';

  @IsOptional()
  @IsString()
  OLLAMA_MODEL?: string = 'llama2';

  // ============================================
  // 邮件 / SMTP 配置
  // 生产环境必须配置
  // ============================================

  @IsOptional()
  @IsString()
  SMTP_HOST?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  SMTP_PORT?: number;

  @IsOptional()
  @IsString()
  SMTP_USER?: string;

  @IsOptional()
  @IsString()
  SMTP_PASS?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  EMAIL_FROM?: string;

  // ============================================
  // 日志配置
  // ============================================

  @IsEnum(LogLevel)
  LOG_LEVEL: LogLevel;

  // ============================================
  // 安全配置
  // ============================================

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ENABLE_CORS?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ENABLE_RATE_LIMIT?: boolean = true;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  RATE_LIMIT_TTL?: number = 60; // 秒

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  RATE_LIMIT_LIMIT?: number = 100; // 请求数

  // ============================================
  // 文件上传配置
  // ============================================

  @IsOptional()
  @IsString()
  UPLOAD_DIR?: string = './uploads';

  @IsOptional()
  @IsInt()
  @Min(1024) // 至少 1KB
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  MAX_FILE_SIZE?: number = 5242880; // 5MB (bytes)

  // ============================================
  // 第三方服务配置
  // ============================================

  @IsOptional()
  @IsString()
  SENTRY_DSN?: string;

  @IsOptional()
  @IsString()
  AWS_ACCESS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  AWS_SECRET_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  AWS_REGION?: string;

  @IsOptional()
  @IsString()
  AWS_S3_BUCKET?: string;
}

/**
 * 验证环境变量
 *
 * @throws Error 如果验证失败，应用将不会启动
 */
export function validate(config: Record<string, unknown>) {
  // 转换并验证
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  // 执行验证
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map(error => {
      return {
        property: error.property,
        constraints: error.constraints,
        value: process.env[error.property],
      };
    });

    throw new Error(
      `环境变量验证失败:\n${JSON.stringify(errorMessages, null, 2)}`,
    );
  }

  // 生产环境额外安全检查
  if (validatedConfig.NODE_ENV === Environment.PRODUCTION) {
    validateProductionConfig(validatedConfig);
  }

  return validatedConfig;
}

/**
 * 生产环境额外安全检查
 */
function validateProductionConfig(config: EnvironmentVariables) {
  const warnings: string[] = [];

  // 检查 JWT 密钥强度
  if (config.JWT_SECRET.length < 64) {
    warnings.push(
      '⚠️  生产环境 JWT_SECRET 长度应该至少 64 字符，当前: ' +
        config.JWT_SECRET.length,
    );
  }

  // 检查是否使用默认密码
  if (
    config.JWT_SECRET.includes('change') ||
    config.JWT_SECRET.includes('secret') ||
    config.JWT_SECRET.includes('example')
  ) {
    warnings.push('⚠️  生产环境不能使用默认或示例 JWT_SECRET');
  }

  // 检查数据库密码强度
  if (config.DATABASE_URL.includes(':gametalent_password@')) {
    warnings.push('⚠️  生产环境不能使用默认数据库密码');
  }

  // 检查是否配置了监控
  if (!config.SENTRY_DSN) {
    warnings.push('⚠️  生产环境建议配置 Sentry DSN 进行错误追踪');
  }

  // SMTP 配置检查
  if (config.SMTP_HOST && config.SMTP_USER === 'your-email@gmail.com') {
    warnings.push('⚠️  生产环境必须配置真实的 SMTP 凭据');
  }

  if (warnings.length > 0) {
    console.warn('\n========================================');
    console.warn('生产环境安全警告:');
    warnings.forEach(warning => console.warn(warning));
    console.warn('========================================\n');
  }
}
