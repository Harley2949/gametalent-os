import { PrismaClient } from '@gametalent/db';

const prisma = new PrismaClient();

async function manualFixData() {
  console.log('🔧 手动修复乱码数据...\n');

  try {
    await prisma.$connect();

    // 1. 清理或替换明显的乱码候选人数据
    console.log('1️⃣ 处理候选人乱码数据...');

    // 找到所有包含乱码字符的候选人
    const garbledCandidates = await prisma.$queryRaw`
      SELECT id, name, email, "currentCompany", "currentTitle"
      FROM candidates
      WHERE name ~ '[��]' OR "currentCompany" ~ '[��]' OR "currentTitle" ~ '[��]'
    `;

    console.log(`找到 ${(garbledCandidates as any[]).length} 条乱码候选人记录`);

    for (const candidate of garbledCandidates as any[]) {
      const name = candidate.name as string;
      const email = candidate.email as string;

      console.log(`处理候选人: ${name} (${email})`);

      // 策略：如果名字是乱码，设置为"待完善"，保留email
      await prisma.$executeRaw`
        UPDATE candidates
        SET
          name = '待完善',
          "currentCompany" = NULL,
          "currentTitle" = NULL,
          location = NULL
        WHERE id = ${candidate.id}
      `;

      console.log(`✅ 已清理候选人 ${candidate.id}`);
    }

    // 2. 清理或替换乱码的职位数据
    console.log('\n2️⃣ 处理职位乱码数据...');

    const garbledJobs = await prisma.$queryRaw`
      SELECT id, title, department
      FROM jobs
      WHERE title ~ '[��]' OR department ~ '[��]'
    `;

    console.log(`找到 ${(garbledJobs as any[]).length} 条乱码职位记录`);

    for (const job of garbledJobs as any[]) {
      console.log(`处理职位: ${job.title}`);

      // 删除乱码的职位，或者设置为默认值
      await prisma.$executeRaw`
        UPDATE jobs
        SET
          title = '待完善职位名称',
          department = '待完善部门',
          description = '请编辑职位信息'
        WHERE id = ${job.id}
      `;

      console.log(`✅ 已修复职位 ${job.id}`);
    }

    // 3. 修复用户乱码数据
    console.log('\n3️⃣ 处理用户乱码数据...');

    // 手动修复已知的乱码用户
    await prisma.$executeRaw`
      UPDATE users
      SET name = '系统管理员'
      WHERE email = 'admin@gametalent.os'
    `;

    await prisma.$executeRaw`
      UPDATE users
      SET name = '招聘专员'
      WHERE email = 'recruiter@gametalent.os'
    `;

    console.log('✅ 已修复用户名');

    // 4. 验证修复结果
    console.log('\n4️⃣ 验证修复结果...');

    const candidates = await prisma.$queryRaw`
      SELECT id, name, email
      FROM candidates
      LIMIT 8
    `;
    console.log('\n候选人数据:');
    console.table(candidates);

    const jobs = await prisma.$queryRaw`
      SELECT id, title, department
      FROM jobs
      LIMIT 5
    `;
    console.log('\n职位数据:');
    console.table(jobs);

    const users = await prisma.$queryRaw`
      SELECT id, email, name, role
      FROM users
      LIMIT 5
    `;
    console.log('\n用户数据:');
    console.table(users);

    console.log('\n✅ 数据清理完成！');

    // 5. 统计结果
    const stats = await prisma.$queryRaw`
      SELECT
        (SELECT COUNT(*) FROM candidates WHERE name = '待完善') as candidate_count,
        (SELECT COUNT(*) FROM jobs WHERE title = '待完善职位名称') as job_count,
        (SELECT COUNT(*) FROM users WHERE name NOT IN ('Test User', '系统管理员', '招聘专员')) as user_count
    `;

    console.log('\n📊 清理统计:');
    console.table(stats);

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualFixData();
