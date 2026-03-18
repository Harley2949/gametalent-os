import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('🔧 创建测试用户...\n');

  // 1. 创建或更新管理员账号
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gametalent.os' },
    update: {
      password: adminPassword,
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@gametalent.os',
      name: '系统管理员',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      department: '技术部',
      title: '系统管理员',
    },
  });
  console.log('✅ 管理员账号已就绪');
  console.log('   邮箱: admin@gametalent.os');
  console.log('   密码: admin123\n');

  // 2. 创建或更新 HR 账号
  const hrPassword = await bcrypt.hash('hr123456', 10);
  const hr = await prisma.user.upsert({
    where: { email: 'hr@gametalent.os' },
    update: {
      password: hrPassword,
      status: 'ACTIVE',
    },
    create: {
      email: 'hr@gametalent.os',
      name: 'HR 招聘专员',
      password: hrPassword,
      role: 'RECRUITER',
      status: 'ACTIVE',
      department: '人力资源部',
      title: '招聘专员',
    },
  });
  console.log('✅ HR 账号已就绪');
  console.log('   邮箱: hr@gametalent.os');
  console.log('   密码: hr123456\n');

  // 3. 验证用户列表
  const allUsers = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      status: true,
    },
  });

  console.log('📋 所有用户列表:');
  allUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.status}`);
  });

  await prisma.$disconnect();
}

createTestUsers()
  .then(() => {
    console.log('\n✨ 测试用户创建完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 创建失败:', error);
    process.exit(1);
  });
