/**
 * 安全密钥生成工具
 *
 * 生成符合安全要求的各种密钥和密码
 *
 * 使用方法:
 *   npx ts-node scripts/generate-secrets.ts
 *   npx ts-node scripts/generate-secrets.ts --jwt        # 仅生成 JWT 密钥
 *   npx ts-node scripts/generate-secrets.ts --db         # 仅生成数据库密码
 *   npx ts-node scripts/generate-secrets.ts --all        # 生成所有密钥
 */

import crypto from 'crypto';

/**
 * 生成安全的随机字符串
 *
 * @param length - 字符串长度（字节数，会转换为 hex，所以实际长度是 length * 2）
 * @returns - 十六进制编码的随机字符串
 */
function generateSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 生成符合要求的 JWT 密钥
 *
 * 安全要求:
 * - 开发环境: 至少 32 字符
 * - 生产环境: 至少 64 字符
 *
 * @param env - 环境 (development | production)
 * @returns - JWT 密钥
 */
function generateJWTSecret(env: 'development' | 'production' = 'production'): string {
  const length = env === 'production' ? 32 : 16; // hex 编码后为 64 或 32 字符
  return generateSecret(length);
}

/**
 * 生成数据库密码
 *
 * 要求:
 * - 至少 16 字符
 * - 包含大小写字母、数字、特殊字符
 *
 * @returns - 数据库密码
 */
function generateDatabasePassword(): string {
  const length = 24;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

  let password = '';
  const randomValues = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  return password;
}

/**
 * 生成 API 密钥
 *
 * 格式: gt_live_xxxxx 或 gt_test_xxxxx
 *
 * @param environment - 环境 (production | test)
 * @returns - API 密钥
 */
function generateApiKey(environment: 'production' | 'test' = 'production'): string {
  const prefix = environment === 'production' ? 'gt_live' : 'gt_test';
  const secret = crypto.randomBytes(16).toString('base64').replace(/[+/=]/g, '').substring(0, 24);
  return `${prefix}_${secret}`;
}

/**
 * 生成加密密钥（用于敏感数据加密）
 *
 * @returns - 32 字节的加密密钥（hex 格式）
 */
function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 生成会话密钥
 *
 * @returns - 会话密钥
 */
function generateSessionSecret(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * 生成 OAuth 状态密钥
 *
 * @returns - OAuth 状态密钥
 */
function generateOAuthStateSecret(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 生成所有密钥并输出为环境变量格式
 */
function generateAllSecrets(): void {
  console.log('\n========================================');
  console.log('   🔐 GameTalent OS - 安全密钥生成器');
  console.log('========================================\n');

  const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

  console.log(`📋 环境: ${env}`);
  console.log(`⏰ 生成时间: ${new Date().toISOString()}\n`);

  // JWT 密钥
  console.log('🔑 JWT_SECRET=' + generateJWTSecret(env));
  console.log('   用途: JWT Token 签名');
  console.log('   长度: ' + (env === 'production' ? '64' : '32') + ' 字符\n');

  // 数据库密码
  const dbPassword = generateDatabasePassword();
  console.log('🗄️  DATABASE_PASSWORD=' + dbPassword);
  console.log('   用途: 数据库连接密码');
  console.log('   长度: ' + dbPassword.length + ' 字符\n');

  // 加密密钥
  console.log('🔐 ENCRYPTION_KEY=' + generateEncryptionKey());
  console.log('   用途: 敏感数据加密');
  console.log('   长度: 64 字符 (hex)\n');

  // 会话密钥
  console.log('📝 SESSION_SECRET=' + generateSessionSecret());
  console.log('   用途: 会话管理');
  console.log('   长度: 48 字符 (hex)\n');

  // OAuth 密钥
  console.log('🔗 OAUTH_STATE_SECRET=' + generateOAuthStateSecret());
  console.log('   用途: OAuth 状态验证');
  console.log('   长度: 32 字符 (hex)\n');

  // API 密钥
  console.log('🚀 API_KEY_PRODUCTION=' + generateApiKey('production'));
  console.log('   用途: 生产环境 API 调用\n');

  console.log('🧪 API_KEY_TEST=' + generateApiKey('test'));
  console.log('   用途: 测试环境 API 调用\n');

  console.log('========================================');
  console.log('⚠️  重要提示:');
  console.log('========================================');
  console.log('1. 请立即将这些密钥保存到安全的密钥管理系统');
  console.log('2. 不要将密钥提交到 Git 仓库');
  console.log('3. 生产环境密钥应该使用密钥管理服务（如 AWS Secrets Manager）');
  console.log('4. 定期轮换密钥（建议每 90 天）');
  console.log('5. 如果密钥泄露，立即重新生成并更新\n');
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
使用方法:
  npx ts-node scripts/generate-secrets.ts [选项]

选项:
  --jwt          仅生成 JWT 密钥
  --db           仅生成数据库密码
  --api          仅生成 API 密钥
  --all          生成所有密钥（默认）
  --help, -h     显示帮助信息

示例:
  npx ts-node scripts/generate-secrets.ts
  npx ts-node scripts/generate-secrets.ts --jwt
  npx ts-node scripts/generate-secrets.ts --all
`);
    process.exit(0);
  }

  if (args.includes('--jwt')) {
    const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    console.log('JWT_SECRET=' + generateJWTSecret(env));
  } else if (args.includes('--db')) {
    console.log('DATABASE_PASSWORD=' + generateDatabasePassword());
  } else if (args.includes('--api')) {
    console.log('API_KEY_PRODUCTION=' + generateApiKey('production'));
    console.log('API_KEY_TEST=' + generateApiKey('test'));
  } else {
    // 默认生成所有密钥
    generateAllSecrets();
  }
}

// 运行
if (require.main === module) {
  main();
}

export {
  generateSecret,
  generateJWTSecret,
  generateDatabasePassword,
  generateApiKey,
  generateEncryptionKey,
  generateSessionSecret,
  generateOAuthStateSecret,
};
