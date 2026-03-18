const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixApplicationPermissions() {
  try {
    console.log('🔧 开始修复应聘记录创建权限...\n');
    
    // 1. 获取用户和ADMIN角色
    const user = await prisma.user.findUnique({
      where: { email: 'demo@test.com' },
      include: {
        roleMappings: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    if (!user) {
      console.log('❌ 用户不存在');
      return;
    }
    
    console.log('✅ 用户:', user.email);
    console.log('   RoleMappings数量:', user.roleMappings.length);
    
    // 2. 查找ADMIN角色
    const adminRole = await prisma.role.findFirst({
      where: { name: 'ADMIN' },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    
    if (!adminRole) {
      console.log('❌ ADMIN角色不存在');
      return;
    }
    
    console.log('\n✅ ADMIN角色:', adminRole.name);
    console.log('   当前权限数量:', adminRole.permissions.length);
    
    // 3. 检查是否有applications:create权限
    const hasCreatePermission = adminRole.permissions.some(p => 
      p.permission.resource === 'applications' && p.permission.action === 'create'
    );
    
    console.log('\n   applications:create权限:', hasCreatePermission ? '✅ 已存在' : '❌ 缺失');
    
    if (!hasCreatePermission) {
      // 创建applications:create权限
      const createPermission = await prisma.permission.create({
        data: {
          name: 'applications:create',
          description: '创建应聘记录',
          resource: 'applications',
          action: 'create',
        },
      });
      
      console.log('   ✅ 创建权限: applications:create');
      
      // 关联到ADMIN角色
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: createPermission.id,
        },
      });
      
      console.log('   ✅ 关联权限到ADMIN角色');
    }
    
    // 4. 检查是否有applications:delete权限
    const hasDeletePermission = adminRole.permissions.some(p => 
      p.permission.resource === 'applications' && p.permission.action === 'delete'
    );
    
    if (!hasDeletePermission) {
      const deletePermission = await prisma.permission.create({
        data: {
          name: 'applications:delete',
          description: '删除应聘记录',
          resource: 'applications',
          action: 'delete',
        },
      });
      
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: deletePermission.id,
        },
      });
      
      console.log('   ✅ 添加权限: applications:delete');
    }
    
    // 5. 检查UserRoleMapping
    const hasMapping = user.roleMappings.some(m => m.roleId === adminRole.id);
    if (!hasMapping) {
      await prisma.userRoleMapping.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });
      
      console.log('\n✅ 创建UserRoleMapping');
    } else {
      console.log('\n✅ UserRoleMapping已存在');
    }
    
    console.log('\n🎉 权限修复完成！现在应该可以创建应聘记录了。');
    
  } catch (error) {
    console.error('\n❌ 修复失败:', error.message);
    if (error.meta) {
      console.error('   详细信息:', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixApplicationPermissions();
