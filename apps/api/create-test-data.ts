import { PrismaClient } from '@gametalent/db';

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建测试数据...');

  // 创建测试候选人
  const candidate1 = await prisma.candidate.create({
    data: {
      name: '张三',
      email: 'zhangsan@example.com',
      phoneNumber: '13800138000',
      status: 'ACTIVE',
      source: 'UPLOAD',
      currentTitle: '高级游戏开发工程师',
      currentCompany: '某游戏公司',
      educationLevel: 'BACHELOR',
      isOverseasEducation: false,
    },
  });

  console.log('✅ 创建候选人1:', candidate1.name);

  const candidate2 = await prisma.candidate.create({
    data: {
      name: '李四',
      email: 'lisi@example.com',
      phoneNumber: '13900139000',
      status: 'ACTIVE',
      source: 'LINKEDIN',
      currentTitle: 'Unity 3D 开发工程师',
      currentCompany: '创意工作室',
      educationLevel: 'MASTER',
      isOverseasEducation: true,
    },
  });

  console.log('✅ 创建候选人2:', candidate2.name);

  // 创建技能标签
  await prisma.candidate.update({
    where: { id: candidate1.id },
    data: {
      tags: ['Unity 3D', 'C#', '游戏开发', 'RPG'],
    },
  });

  await prisma.candidate.update({
    where: { id: candidate2.id },
    data: {
      tags: ['Unreal Engine', 'C++', '图形编程', 'Shader'],
    },
  });

  console.log('✅ 测试数据创建完成！');
  console.log('候选人1 ID:', candidate1.id);
  console.log('候选人2 ID:', candidate2.id);
}

main()
  .catch((e) => {
    console.error('❌ 创建测试数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
