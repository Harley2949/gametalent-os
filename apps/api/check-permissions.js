const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPermissions() {
  try {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: 'demo@test.com' },
      include: {
        roleMappings: {
          include: {
            role: {
              include: {
                permissions: true,
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
    
    console.log('✅ 用户信息:');
    console.log('   ID:', user.id);
    console.log('   邮箱:', user.email);
    console.log('   角色:', user.role);
    console.log('   状态:', user.status);
    
    console.log('\n📋 角色权限映射:');
    if (user.roleMappings && user.roleMappings.length > 0) {
      user.roleMappings.forEach(mapping => {
        console.log(`   角色: ${mapping.role.name} (${mapping.role.displayName})`);
        console.log(`   权限数量: ${mapping.role.permissions ? mapping.role.permissions.length : 0}`);
        
        if (mapping.role.permissions && mapping.role.permissions.length > 0) {
          console.log('\n   具体权限:');
          mapping.role.permissions.forEach(perm => {
            console.log(`     - ${perm.resource}:${perm.action || '*'}`);
          });
        }
      });
    } else {
      console.log('   ⚠️ 没有找到角色权限映射');
    }
    
    // 检查是否有applications:create权限
    const hasPermission = user.roleMappings?.some(mapping => 
      mapping.role.permissions?.some(perm => 
        perm.resource === 'applications' && (perm.action === 'create' || perm.action === '*')
      )
    );
    
    console.log('\n✅ applications:create权限:', hasPermission ? '✅ 有' : '❌ 没有');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions();
