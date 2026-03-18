import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPermissions() {
  console.log('=== 检查权限系统 ===\n');
  
  // 检查角色
  const roles = await prisma.role.findMany();
  console.log(`📋 角色数量: ${roles.length}`);
  roles.forEach(role => {
    console.log(`  - ${role.name} (系统角色: ${role.isSystem})`);
  });
  
  // 检查权限
  const permissions = await prisma.permission.findMany();
  console.log(`\n📋 权限数量: ${permissions.length}`);
  permissions.forEach(p => {
    console.log(`  - ${p.name} (${p.resource}:${p.action})`);
  });
  
  // 检查角色权限关联
  const rolePermissions = await prisma.rolePermission.findMany({
    include: { role: true, permission: true }
  });
  console.log(`\n📋 角色权限关联数量: ${rolePermissions.length}`);
  if (rolePermissions.length > 0) {
    rolePermissions.forEach(rp => {
      console.log(`  - ${rp.role.name} -> ${rp.permission.name}`);
    });
  }
  
  // 检查用户角色关联
  const userRoles = await prisma.userRoleMapping.findMany({
    include: { role: true }
  });
  console.log(`\n📋 用户角色关联数量: ${userRoles.length}`);
  userRoles.forEach(ur => {
    console.log(`  - 用户 ${ur.userId} -> ${ur.role.name}`);
  });
  
  await prisma.$disconnect();
}

checkPermissions().catch(console.error);
