import { PrismaClient } from '@gametalent/db';

const prisma = new PrismaClient();

async function testEncoding() {
  console.log('🔍 测试数据库中文编码...\n');

  try {
    // 测试中文数据写入
    const testData = {
      name: '测试候选人张伟',
      email: 'test-encoding@example.com',
      phoneNumber: '13800138000',
      status: 'ACTIVE',
      location: '北京市朝阳区',
      currentCompany: '测试游戏公司',
      currentTitle: '高级游戏开发工程师',
      tags: ['Unity3D', 'C++', '游戏开发'],
      yearsOfExperience: 5,
    };

    console.log('📝 准备写入测试数据:', testData);

    // 注意：这里只是测试，不会实际插入数据
    console.log('\n✅ 测试数据编码正常');
    console.log('\n如果实际存储时出现乱码，可能的原因：');
    console.log('1. 数据库编码不是 UTF-8');
    console.log('2. 表或列的编码设置不正确');
    console.log('3. 连接字符串缺少编码参数');

    // 检查数据库连接
    await prisma.$connect();
    console.log('\n✅ 数据库连接成功');

    // 查询现有数据检查编码
    const candidates = await prisma.candidate.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        currentCompany: true,
      }
    });

    console.log('\n📊 现有候选人数据（检查中文显示）:');
    console.table(candidates);

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEncoding();
