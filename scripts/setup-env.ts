/**
 * 环境变量自动配置脚本
 * 
 * 功能：
 * 1. 生成安全的密钥
 * 2. 创建 .env.local 文件
 * 3. 确保 .gitignore 配置正确
 * 
 * 使用方法：npx ts-node scripts/setup-env.ts
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function generateSecret(length: number): string {
  return crypto.randomBytes(length).toString('hex');
}

function generateDatabasePassword(): string {
  const length = 24;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = '';
  const randomValues = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  
  return password;
}

function createEnvFile(): void {
  const envPath = path.join(process.cwd(), '.env.local');
  
  const envContent = `# ⚠️  安全提示：此文件包含敏感信息，已自动添加到 .gitignore
# 由 scripts/setup-env.ts 自动生成
# 生成时间: ${new Date().toISOString()}

# ===================================
# JWT 认证配置
# ===================================
JWT_SECRET="${generateSecret(64)}"
JWT_EXPIRES_IN="7d"

# ===================================
# 数据库配置
# ===================================
DATABASE_URL="postgresql://gametalent:${generateDatabasePassword()}@127.0.0.1:5432/gametalent_os?schema=public&client_encoding=UTF8"

# ===================================
# API 配置
# ===================================
PORT=3006
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# ===================================
# AI / Ollama 配置
# ===================================
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama2"

# ===================================
# 应用配置
# ===================================
APP_NAME="GameTalent OS"
APP_URL="http://localhost:3000"
LOG_LEVEL="debug"

# ===================================
# 邮件配置（可选，根据需要配置）
# ===================================
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"
# EMAIL_FROM="noreply@gametalent.com"
`;

  // 备份现有文件
  if (fs.existsSync(envPath)) {
    const backupPath = `${envPath}.backup.${Date.now()}`;
    fs.copyFileSync(envPath, backupPath);
    console.log(`✅ 已备份现有配置到: ${path.basename(backupPath)}`);
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ 已创建 .env.local 文件`);
}

function updateGitignore(): void {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  let gitignoreContent = '';
  
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  }
  
  const securityEntries = [
    '# Security - sensitive files',
    '.env.local',
    '.env.production',
    '.env.*.local',
    '*.key',
    'secrets/',
    '.env.backup.*',
    '',
  ];
  
  const existingLines = gitignoreContent.split('\n');
  let needsUpdate = false;
  
  for (const entry of securityEntries) {
    if (entry && !existingLines.some(line => line.trim() === entry.trim())) {
      gitignoreContent += `${entry}\n`;
      needsUpdate = true;
    }
  }
  
  if (needsUpdate) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ 已更新 .gitignore 文件');
  } else {
    console.log('✅ .gitignore 已经包含必要的安全配置');
  }
}

function main() {
  console.log('🔐 GameTalent OS - 环境变量自动配置\n');
  
  console.log('⚠️  重要提示：');
  console.log('   - 此脚本将生成安全密钥并保存到 .env.local');
  console.log('   - .env.local 已自动添加到 .gitignore，不会被提交到 Git');
  console.log('   - 生产环境请使用专业的密钥管理服务\n');
  
  console.log('🔄 正在配置...');
  console.log('');
  
  createEnvFile();
  console.log('');
  
  updateGitignore();
  console.log('');
  
  console.log('✅ 配置完成！');
  console.log('');
  console.log('📋 下一步操作：');
  console.log('   1. 检查 .env.local 文件内容');
  console.log('   2. 根据需要修改配置（如邮件配置等）');
  console.log('   3. 启动应用: pnpm dev');
  console.log('');
}

main().catch((error) => {
  console.error('❌ 配置失败:', error.message);
  process.exit(1);
});
