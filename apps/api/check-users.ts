import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('=== 现有用户列表 ===\n');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  
  console.log(`总用户数: ${users.length}\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`);
    console.log(`   角色: ${user.role}`);
    console.log(`   状态: ${user.status}`);
    console.log(`   创建时间: ${user.createdAt.toLocaleString('zh-CN')}\n`);
  });
  
  await prisma.$disconnect();
}

checkUsers().catch(console.error);
