import { PrismaClient } from '@gametalent/db';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔍 开始创建测试用户...');

    // 1. 获取或创建默认角色
    console.log('📋 检查默认角色...');
    let adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
    if (!adminRole) {
      adminRole = await prisma.role.create({ data: { name: 'ADMIN', description: '系统管理员' } });
      console.log('✅ 创建 ADMIN 角色');
    } else {
      console.log('✅ ADMIN 角色已存在');
    }

    let recruiterRole = await prisma.role.findFirst({ where: { name: 'RECRUITER' } });
    if (!recruiterRole) {
      recruiterRole = await prisma.role.create({ data: { name: 'RECRUITER', description: '招聘专员' } });
      console.log('✅ 创建 RECRUITER 角色');
    } else {
      console.log('✅ RECRUITER 角色已存在');
    }

    // 2. 创建测试用户
    console.log('👤 创建测试用户...');
    const hashedPassword = await bcrypt.hash('demo123', 10);

    const user = await prisma.user.upsert({
      where: { email: 'demo@test.com' },
      update: {},
      create: {
        email: 'demo@test.com',
        name: 'Demo User',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        avatar: null,
        roleMappings: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    console.log('✅ 测试用户创建成功:');
    console.log('邮箱: demo@test.com');
    console.log('密码: demo123');
    console.log('角色:', user.role);
    console.log('用户ID:', user.id);

    // 3. 验证用户
    console.log('🔐 验证用户登录...');
    const isValid = await bcrypt.compare('demo123', user.password || '');
    console.log('密码验证:', isValid ? '✅ 通过' : '❌ 失败');

  } catch (error) {
    console.error('❌ 创建测试用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
