import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function executeMigration() {
  try {
    console.log('🔄 开始执行数据库迁移...');

    // Step 1: Add stage column to candidates table
    console.log('📝 添加 stage 列到 candidates 表...');
    await prisma.$executeRaw`
      ALTER TABLE candidates
      ADD COLUMN IF NOT EXISTS stage VARCHAR(50)
    `;
    console.log('✅ stage 列添加成功');

    // Step 2: Create candidate_stage_history table
    console.log('📝 创建 candidate_stage_history 表...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS candidate_stage_history (
        id VARCHAR(25) PRIMARY KEY,
        "candidateId" VARCHAR(25) NOT NULL,
        "fromStage" VARCHAR(50),
        "toStage" VARCHAR(50) NOT NULL,
        "changedBy" VARCHAR(25),
        "changeReason" TEXT,
        "changeType" VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "candidate_stage_history_candidateId_fkey" FOREIGN KEY ("candidateId")
          REFERENCES candidates(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;
    console.log('✅ candidate_stage_history 表创建成功');

    // Step 3: Create indexes
    console.log('📝 创建索引...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "candidate_stage_history_candidateId_idx"
      ON candidate_stage_history("candidateId")
    `;
    console.log('✅ candidateId 索引创建成功');

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "candidate_stage_history_createdAt_idx"
      ON candidate_stage_history("createdAt")
    `;
    console.log('✅ createdAt 索引创建成功');

    console.log('✅ 迁移执行成功！');
    console.log('📋 已添加:');
    console.log('  - candidates.stage 字段');
    console.log('  - candidate_stage_history 表');
    console.log('  - 相关索引');

    // Regenerate Prisma Client
    console.log('🔄 重新生成 Prisma Client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { cwd: process.cwd(), stdio: 'inherit' });
    console.log('✅ Prisma Client 重新生成完成');

  } catch (error) {
    console.error('❌ 迁移执行失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

executeMigration();
