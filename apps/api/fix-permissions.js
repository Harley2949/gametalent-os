const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPermissions() {
  try {
    console.log('🔧 开始修复权限...');
    
    // 1. 查找用户和ADMIN角色
    const user = await prisma.user.findUnique({
      where: { email: 'demo@test.com' },
    });
    
    const adminRole = await prisma.role.findFirst({
      where: { name: 'ADMIN' },
    });
    
    if (!user || !adminRole) {
      console.log('❌ 用户或角色不存在');
      return;
    }
    
    console.log('✅ 找到用户:', user.email);
    console.log('✅ 找到角色:', adminRole.name);
    
    // 2. 检查是否已有RoleMapping
    const existingMapping = await prisma.roleMapping.findFirst({
      where: {
        userId: user.id,
        roleId: adminRole.id,
      },
    });
    
    if (!existingMapping) {
      // 创建RoleMapping
      await prisma.roleMapping.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });
      console.log('✅ 创建角色映射');
    } else {
      console.log('✅ 角色映射已存在');
    }
    
    // 3. 为ADMIN角色添加所有权限
    const requiredPermissions = [
      'applications:create',
      'applications:update',
      'applications:delete',
      'applications:view',
      'candidates:create',
      'candidates:update',
      'candidates:view',
      'jobs:create',
      'jobs:update',
      'jobs:view',
    ];
    
    for (const permStr of requiredPermissions) {
      const [resource, action] = permStr.split(':');
      
      const existingPerm = await prisma.permission.findFirst({
        where: {
          roleId: adminRole.id,
          resource: resource,
          action: action,
        },
      });
      
      if (!existingPerm) {
        await prisma.permission.create({
          data: {
            roleId: adminRole.id,
            resource: resource,
            action: action,
          },
        });
        console.log(`  ✅ 添加权限: ${permStr}`);
      }
    }
    
    // 添加通配符权限
    const wildcardPerm = await prisma.permission.findFirst({
      where: {
        roleId: adminRole.id,
        resource: '*',
        action: '*',
      },
    });
    
    if (!wildcardPerm) {
      await prisma.permission.create({
        data: {
          roleId: adminRole.id,
          resource: '*',
          action: '*',
        },
      });
      console.log('  ✅ 添加通配符权限: *:*');
    }
    
    console.log('\n✅ 权限修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    console.error('   错误详情:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissions();
