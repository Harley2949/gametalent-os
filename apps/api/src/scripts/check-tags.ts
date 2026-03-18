import { PrismaClient } from '@gametalent/db';

const prisma = new PrismaClient();

async function checkTags() {
  console.log('🔍 检查候选人标签数据...\n');

  try {
    await prisma.$connect();

    // 1. 检查 candidates 表中的 tags 字段
    console.log('1️⃣ 检查 candidates 表的 tags 字段:');
    const candidateTags = await prisma.$queryRaw`
      SELECT
        id,
        name,
        tags,
        encode(tags::text::bytea, 'hex') as tags_hex
      FROM candidates
      WHERE tags IS NOT NULL
      AND array_length(tags, 1) > 0
      LIMIT 10
    `;
    console.table(candidateTags);

    // 2. 检查 SkillTag 表（如果存在）
    console.log('\n2️⃣ 检查 SkillTag 表:');
    const skillTags = await prisma.$queryRaw`
      SELECT * FROM "SkillTag"
      LIMIT 20
    `;
    console.table(skillTags);

    // 3. 查找包含乱码的标签
    console.log('\n3️⃣ 查找包含乱码的候选人标签:');
    const garbledTagCandidates = await prisma.$queryRaw`
      SELECT
        id,
        name,
        tags
      FROM candidates
      WHERE tags::text ~ '[��]'
      LIMIT 20
    `;
    console.log(`找到 ${ (garbledTagCandidates as any[]).length } 条包含乱码标签的候选人`);
    console.table(garbledTagCandidates);

    // 4. 检查 Application 表中的 tags
    console.log('\n4️⃣ 检查应聘记录的标签:');
    const applicationTags = await prisma.$queryRaw`
      SELECT
        id,
        tags
      FROM applications
      WHERE tags IS NOT NULL
      AND array_length(tags, 1) > 0
      LIMIT 10
    `;
    console.table(applicationTags);

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTags();
