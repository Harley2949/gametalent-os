import { PrismaClient } from '@gametalent/db';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@test.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      console.log('❌ 用户不存在');
      return;
    }

    console.log('✅ 找到用户:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role);
    console.log('- Status:', user.status);
    console.log('- Has Password:', !!user.password);

    // 验证密码
    const isValid = await bcrypt.compare('demo123', user.password);
    console.log('- 密码验证:', isValid ? '✅ 正确' : '❌ 错误');

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
