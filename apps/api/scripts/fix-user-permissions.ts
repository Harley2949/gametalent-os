import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixUserPermissions() {
  console.log('🔧 修复用户权限...\n');

  // 1. 确保所有权限存在
  console.log('1️⃣  创建权限...');
  const allPermissions = [
    // 候选人权限
    { name: 'candidates:view', resource: 'candidates', action: 'view', description: '查看候选人' },
    { name: 'candidates:create', resource: 'candidates', action: 'create', description: '创建候选人' },
    { name: 'candidates:update', resource: 'candidates', action: 'update', description: '更新候选人' },
    { name: 'candidates:delete', resource: 'candidates', action: 'delete', description: '删除候选人' },

    // 职位权限
    { name: 'jobs:view', resource: 'jobs', action: 'view', description: '查看职位' },
    { name: 'jobs:create', resource: 'jobs', action: 'create', description: '创建职位' },
    { name: 'jobs:update', resource: 'jobs', action: 'update', description: '更新职位' },
    { name: 'jobs:delete', resource: 'jobs', action: 'delete', description: '删除职位' },

    // 申请权限
    { name: 'applications:view', resource: 'applications', action: 'view', description: '查看申请' },
    { name: 'applications:update', resource: 'applications', action: 'update', description: '更新申请' },

    // 面试权限
    { name: 'interviews:view', resource: 'interviews', action: 'view', description: '查看面试' },
    { name: 'interviews:create', resource: 'interviews', action: 'create', description: '创建面试' },
    { name: 'interviews:update', resource: 'interviews', action: 'update', description: '更新面试' },
    { name: 'interviews:delete', resource: 'interviews', action: 'delete', description: '删除面试' },

    // 分析权限
    { name: 'analytics:view', resource: 'analytics', action: 'view', description: '查看分析' },
  ];

  const permissions: Record<string, any> = {};
  for (const permData of allPermissions) {
    const permission = await prisma.permission.upsert({
      where: { name: permData.name },
      update: {},
      create: permData,
    });
    permissions[permData.name] = permission;
  }
  console.log(`✅ 创建了 ${Object.keys(permissions).length} 个权限\n`);

  // 2. 确保角色存在
  console.log('2️⃣  创建角色...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: '系统管理员',
      isSystem: true,
    },
  });

  const recruiterRole = await prisma.role.upsert({
    where: { name: 'RECRUITER' },
    update: {},
    create: {
      name: 'RECRUITER',
      description: '招聘人员',
      isSystem: false,
    },
  });
  console.log('✅ 角色就绪\n');

  // 3. 给ADMIN角色分配所有权限
  console.log('3️⃣  给ADMIN角色分配所有权限...');
  // 先删除旧的权限关联
  await prisma.rolePermission.deleteMany({
    where: { roleId: adminRole.id },
  });

  // 添加所有权限
  for (const permission of Object.values(permissions)) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log(`✅ ADMIN角色已分配 ${Object.keys(permissions).length} 个权限\n`);

  // 4. 给RECRUITER角色分配部分权限
  console.log('4️⃣  给RECRUITER角色分配权限...');
  const recruiterPermissions = [
    'candidates:view', 'candidates:create', 'candidates:update',
    'jobs:view', 'jobs:create', 'jobs:update',
    'applications:view', 'applications:update',
    'interviews:view', 'interviews:create', 'interviews:update',
    'analytics:view',
  ];

  // 先删除旧的权限关联
  await prisma.rolePermission.deleteMany({
    where: { roleId: recruiterRole.id },
  });

  // 添加权限
  for (const permName of recruiterPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: recruiterRole.id,
        permissionId: permissions[permName].id,
      },
    });
  }
  console.log(`✅ RECRUITER角色已分配 ${recruiterPermissions.length} 个权限\n`);

  // 5. 创建/更新用户并关联角色
  console.log('5️⃣  创建测试用户并关联角色...');

  // 管理员账号
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gametalent.os' },
    update: {
      password: adminPassword,
      status: 'ACTIVE',
      role: 'ADMIN',
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

  // 删除旧的角色映射
  await prisma.userRoleMapping.deleteMany({
    where: { userId: admin.id },
  });

  // 创建新的角色映射
  await prisma.userRoleMapping.create({
    data: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });
  console.log('✅ 管理员账号已配置: admin@gametalent.os\n');

  // HR账号
  const hrPassword = await bcrypt.hash('hr123456', 10);
  const hr = await prisma.user.upsert({
    where: { email: 'hr@gametalent.os' },
    update: {
      password: hrPassword,
      status: 'ACTIVE',
      role: 'RECRUITER',
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

  // 删除旧的角色映射
  await prisma.userRoleMapping.deleteMany({
    where: { userId: hr.id },
  });

  // 创建新的角色映射
  await prisma.userRoleMapping.create({
    data: {
      userId: hr.id,
      roleId: recruiterRole.id,
    },
  });
  console.log('✅ HR账号已配置: hr@gametalent.os\n');

  // 6. 显示所有用户
  console.log('6️⃣  所有用户列表:');
  const allUsers = await prisma.user.findMany({
    include: {
      roleMappings: {
        include: {
          role: true,
        },
      },
    },
  });

  for (const user of allUsers) {
    const roles = user.roleMappings.map(rm => rm.role.name).join(', ');
    console.log(`   👤 ${user.name} (${user.email})`);
    console.log(`      角色: ${roles || '未分配'}`);
    console.log(`      状态: ${user.status}\n`);
  }

  await prisma.$disconnect();
}

fixUserPermissions()
  .then(() => {
    console.log('✨ 用户权限修复完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  });
