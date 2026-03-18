import { PrismaClient } from '@gametalent/db';

const prisma = new PrismaClient();

/**
 * 尝试修复乱码的 UTF-8 文本
 * 当数据被错误地从 GBK/Latin1 解码为 UTF-8 时，可以尝试重新编码
 */
function fixGarbledText(text: string | null): string | null {
  if (!text) return null;

  try {
    // 检查是否包含可能的乱码字符（连续的替换字符）
    const hasGarbled = /[\uFFFD\u00BF][\uFFFD\u00BF]+/.test(text) ||
                      /[��]+/.test(text) ||
                      text.includes('') ||
                      text.includes('');

    if (!hasGarbled) {
      // 检查是否是有效的 UTF-8 中文
      const hasValidChinese = /[\u4e00-\u9fa5]/.test(text);
      if (hasValidChinese) {
        return text; // 已经是正常的中文
      }
    }

    // 尝试从 Latin1/Windows-1252 重新解码
    const buffer = Buffer.from(text, 'latin1');
    const decoded = buffer.toString('utf8');

    // 验证修复后的文本是否包含有效的中文
    if (/[\u4e00-\u9fa5]/.test(decoded)) {
      console.log(`✅ 修复成功: "${text}" -> "${decoded}"`);
      return decoded;
    }

    return text;
  } catch (error) {
    console.warn(`⚠️ 无法修复文本: ${text}`);
    return text;
  }
}

/**
 * 更智能的乱码修复 - 尝试多种编码
 */
function smartFixGarbledText(text: string | null): string | null {
  if (!text) return null;

  // 如果已经包含有效中文，直接返回
  if (/[\u4e00-\u9fa5]{2,}/.test(text)) {
    return text;
  }

  // 检测是否包含乱码模式
  const garbledPatterns = [
    /[��]{3,}/,           // 连续的替换字符
    /[\u00BF]{2,}/,       // 倒问号
    /[\u00FD\u00FE]{2,}/, // 其他Latin1特殊字符
  ];

  const isGarbled = garbledPatterns.some(pattern => pattern.test(text));

  if (!isGarbled && text.length < 10) {
    return text;
  }

  // 尝试不同的编码组合
  const encodings = ['latin1', 'gbk', 'gb2312', 'big5'];

  for (const encoding of encodings) {
    try {
      // 先转为 buffer（当作 utf8）
      const buffer = Buffer.from(text, 'utf8');

      // 尝试用目标编码解码
      const decoded = buffer.toString(encoding as any);

      // 再编码为 utf8
      const refixed = Buffer.from(decoded, encoding as any).toString('utf8');

      // 验证是否包含有效中文
      if (/[\u4e00-\u9fa5]{2,}/.test(refixed)) {
        console.log(`✅ 修复 (${encoding}): "${text.substring(0, 20)}..." -> "${refixed.substring(0, 20)}..."`);
        return refixed;
      }
    } catch (error) {
      // 继续尝试下一个编码
      continue;
    }
  }

  // 如果所有方法都失败，返回原文本
  console.warn(`⚠️ 无法修复: "${text.substring(0, 30)}..."`);
  return text;
}

async function fixGarbledData() {
  console.log('🔧 开始修复数据库中的乱码数据...\n');

  try {
    await prisma.$connect();

    // 1. 修复 Candidate 表
    console.log('1️⃣ 修复候选人数据...');
    const candidates = await prisma.candidate.findMany({
      where: {
        OR: [
          { name: { contains: '' } },
          { name: { contains: '' } },
          { currentCompany: { contains: '' } },
          { currentTitle: { contains: '' } },
        ]
      },
      take: 50
    });

    console.log(`找到 ${candidates.length} 条可能乱码的候选人记录`);

    for (const candidate of candidates) {
      const fixedName = smartFixGarbledText(candidate.name) || '未命名';
      const fixedCompany = smartFixGarbledText(candidate.currentCompany);
      const fixedTitle = smartFixGarbledText(candidate.currentTitle);
      const fixedLocation = smartFixGarbledText(candidate.location);

      if (fixedName !== candidate.name ||
          fixedCompany !== candidate.currentCompany ||
          fixedTitle !== candidate.currentTitle ||
          fixedLocation !== candidate.location) {

        await prisma.candidate.update({
          where: { id: candidate.id },
          data: {
            name: fixedName || '未命名',
            currentCompany: fixedCompany,
            currentTitle: fixedTitle,
            location: fixedLocation,
          }
        });

        console.log(`✅ 已修复候选人 ${candidate.id}: ${candidate.name} -> ${fixedName}`);
      }
    }

    // 2. 修复 Job 表
    console.log('\n2️⃣ 修复职位数据...');
    const jobs = await prisma.job.findMany({
      where: {
        OR: [
          { title: { contains: '' } },
          { title: { contains: '' } },
          { department: { contains: '' } },
          { location: { contains: '' } },
        ]
      },
      take: 50
    });

    console.log(`找到 ${jobs.length} 条可能乱码的职位记录`);

    for (const job of jobs) {
      const fixedTitle = smartFixGarbledText(job.title);
      const fixedDepartment = smartFixGarbledText(job.department);
      const fixedLocation = smartFixGarbledText(job.location);

      if (fixedTitle !== job.title ||
          fixedDepartment !== job.department ||
          fixedLocation !== job.location) {

        await prisma.job.update({
          where: { id: job.id },
          data: {
            title: fixedTitle,
            department: fixedDepartment,
            location: fixedLocation,
          }
        });

        console.log(`✅ 已修复职位 ${job.id}: ${job.title} -> ${fixedTitle}`);
      }
    }

    // 3. 修复 User 表
    console.log('\n3️⃣ 修复用户数据...');
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: '' } },
          { name: { contains: '' } },
        ]
      },
      take: 50
    });

    console.log(`找到 ${users.length} 条可能乱码的用户记录`);

    for (const user of users) {
      const fixedName = smartFixGarbledText(user.name);

      if (fixedName !== user.name) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            name: fixedName,
          }
        });

        console.log(`✅ 已修复用户 ${user.id}: ${user.name} -> ${fixedName}`);
      }
    }

    // 4. 验证修复结果
    console.log('\n4️⃣ 验证修复结果...');
    const verifyCandidates = await prisma.candidate.findMany({
      select: {
        id: true,
        name: true,
        currentCompany: true,
      },
      take: 5
    });
    console.log('候选人数据（修复后）:');
    console.table(verifyCandidates);

    const verifyJobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        department: true,
      },
      take: 5
    });
    console.log('\n职位数据（修复后）:');
    console.table(verifyJobs);

    const verifyUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      take: 5
    });
    console.log('\n用户数据（修复后）:');
    console.table(verifyUsers);

    console.log('\n✅ 乱码数据修复完成！');

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGarbledData();
