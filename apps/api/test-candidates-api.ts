import { PrismaClient } from '@gametalent/db';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查候选人数据...\n');

  // 查询所有候选人
  const candidates = await prisma.candidate.findMany({
    include: {
      resumes: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`✅ 找到 ${candidates.length} 个候选人：\n`);

  candidates.forEach((c, index) => {
    console.log(`${index + 1}. ${c.name} (${c.email})`);
    console.log(`   状态: ${c.status}`);
    console.log(`   来源: ${c.source}`);
    console.log(`   当前职位: ${c.currentTitle || '未填写'}`);
    console.log(`   标签: ${c.tags?.join(', ') || '无'}`);
    console.log(`   简历数量: ${c.resumes?.length || 0}`);
    console.log(`   创建时间: ${c.createdAt.toISOString()}`);
    console.log(`   ID: ${c.id}`);
    console.log('');
  });

  // 测试API返回格式
  console.log('📊 模拟API返回格式：');
  const apiResponse = {
    data: candidates,
    total: candidates.length,
    page: 1,
    pageSize: 10,
  };
  console.log(JSON.stringify(apiResponse, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ 查询失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
