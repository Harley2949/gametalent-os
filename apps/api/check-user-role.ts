import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserRole() {
  const userId = 'cmmnb7jgi000210c0ikhqx3y7';
  
  console.log('=== 检查用户角色映射 ===\n');
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  
  if (user) {
    console.log(`用户: ${user.email}`);
    console.log(`Role 字段: ${user.role}`);
    console.log(`\n角色映射数量: ${user.roleMappings.length}`);
    
    for (const rm of user.roleMappings) {
      console.log(`\n角色: ${rm.role.name}`);
      console.log(`权限数量: ${rm.role.permissions.length}`);
      console.log('权限列表:');
      for (const rp of rm.role.permissions) {
        console.log(`  - ${rp.permission.name}`);
      }
    }
  } else {
    console.log('用户不存在');
  }
  
  await prisma.$disconnect();
}

checkUserRole().catch(console.error);
