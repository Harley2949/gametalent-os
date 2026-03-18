import { PrismaClient } from '@gametalent/db';

const prisma = new PrismaClient();

async function fixGarbledTags() {
  console.log('🔧 修复候选人标签乱码...\n');

  try {
    await prisma.$connect();

    // 1. 获取所有有标签的候选人
    const candidates = await prisma.candidate.findMany({
      where: {
        tags: {
          isEmpty: false
        }
      },
      select: {
        id: true,
        name: true,
        tags: true
      },
      take: 100
    });

    console.log(`找到 ${candidates.length} 个有标签的候选人\n`);

    let fixedCount = 0;

    for (const candidate of candidates) {
      if (!candidate.tags || candidate.tags.length === 0) continue;

      const originalTags = [...candidate.tags];
      const fixedTags: string[] = [];

      let needsFix = false;

      for (const tag of candidate.tags) {
        // 检查是否包含乱码字符
        if (/[��]/.test(tag)) {
          needsFix = true;

          // 尝试修复或跳过乱码标签
          // 这里我们选择跳过乱码标签，只保留正常的
          if (!/[��]/.test(tag) && tag.length > 0) {
            fixedTags.push(tag);
          }

          console.log(`  - 发现乱码标签: "${tag}" (将移除)`);
        } else {
          fixedTags.push(tag);
        }
      }

      if (needsFix) {
        await prisma.candidate.update({
          where: { id: candidate.id },
          data: {
            tags: fixedTags
          }
        });

        console.log(`✅ 已修复候选人 ${candidate.id}:`);
        console.log(`   原始标签: ${originalTags.join(', ')}`);
        console.log(`   修复后: ${fixedTags.join(', ') || '(无标签)'}`);
        fixedCount++;
      }
    }

    console.log(`\n✅ 共修复 ${fixedCount} 个候选人的标签\n`);

    // 2. 验证修复结果
    console.log('验证修复结果:');
    const verifiedCandidates = await prisma.candidate.findMany({
      where: {
        tags: {
          isEmpty: false
        }
      },
      select: {
        id: true,
        name: true,
        tags: true
      },
      take: 10
    });

    console.table(verifiedCandidates.map(c => ({
      id: c.id.substring(0, 20) + '...',
      name: c.name,
      tags: c.tags?.join(', ') || '无'
    })));

    // 3. 检查是否还有乱码标签
    const stillGarbled = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM candidates
      WHERE tags::text ~ '[��]'
    `;

    console.log(`\n剩余乱码标签记录数: ${(stillGarbled as any[])[0].count}`);

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGarbledTags();
