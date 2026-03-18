import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 初始化认证与权限数据
 *
 * 创建：
 * 1. 权限（Permissions）
 * 2. 角色（Roles）及其权限关联
 * 3. 默认测试账号
 */
export async function seedAuth() {
  console.log('🌱 开始初始化认证与权限数据...');

  // ============================================
  // 1. 创建权限
  // ============================================
  const permissions = [
    // 候选人管理
    { name: 'candidates:view', resource: 'candidates', action: 'view', description: '查看候选人' },
    { name: 'candidates:create', resource: 'candidates', action: 'create', description: '创建候选人' },
    { name: 'candidates:update', resource: 'candidates', action: 'update', description: '编辑候选人' },
    { name: 'candidates:delete', resource: 'candidates', action: 'delete', description: '删除候选人' },
    // 职位管理
    { name: 'jobs:view', resource: 'jobs', action: 'view', description: '查看职位' },
    { name: 'jobs:create', resource: 'jobs', action: 'create', description: '创建职位' },
    { name: 'jobs:update', resource: 'jobs', action: 'update', description: '编辑职位' },
    { name: 'jobs:delete', resource: 'jobs', action: 'delete', description: '删除职位' },
    { name: 'jobs:publish', resource: 'jobs', action: 'publish', description: '发布职位' },
    { name: 'jobs:close', resource: 'jobs', action: 'close', description: '关闭职位' },
    { name: 'jobs:archive', resource: 'jobs', action: 'archive', description: '归档职位' },
    // 应聘流程
    { name: 'applications:view', resource: 'applications', action: 'view', description: '查看应聘记录' },
    { name: 'applications:create', resource: 'applications', action: 'create', description: '创建应聘记录' },
    { name: 'applications:update', resource: 'applications', action: 'update', description: '更新应聘信息' },
    { name: 'applications:delete', resource: 'applications', action: 'delete', description: '删除应聘记录' },
    { name: 'applications:updateStatus', resource: 'applications', action: 'updateStatus', description: '更新应聘状态' },
    // 面试管理
    { name: 'interviews:view', resource: 'interviews', action: 'view', description: '查看面试' },
    { name: 'interviews:create', resource: 'interviews', action: 'create', description: '创建面试' },
    { name: 'interviews:update', resource: 'interviews', action: 'update', description: '编辑面试' },
    { name: 'interviews:delete', resource: 'interviews', action: 'delete', description: '删除面试' },
    { name: 'interviews:submitFeedback', resource: 'interviews', action: 'submitFeedback', description: '提交面试反馈' },
    // 用户管理
    { name: 'users:view', resource: 'users', action: 'view', description: '查看用户' },
    { name: 'users:create', resource: 'users', action: 'create', description: '创建用户' },
    { name: 'users:update', resource: 'users', action: 'update', description: '编辑用户' },
    { name: 'users:delete', resource: 'users', action: 'delete', description: '删除用户' },
    { name: 'users:assignRoles', resource: 'users', action: 'assignRoles', description: '分配角色' },
    // 数据分析
    { name: 'analytics:view', resource: 'analytics', action: 'view', description: '查看数据分析' },
    { name: 'analytics:funnel', resource: 'analytics', action: 'funnel', description: '招聘漏斗分析' },
    { name: 'analytics:conversion', resource: 'analytics', action: 'conversion', description: '转化率分析' },
    { name: 'analytics:timeCycle', resource: 'analytics', action: 'timeCycle', description: '时间周期分析' },
    { name: 'analytics:source', resource: 'analytics', action: 'source', description: '来源效果分析' },
    // 系统管理
    { name: 'system:viewSettings', resource: 'system', action: 'viewSettings', description: '查看系统设置' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log(`✅ 创建了 ${permissions.length} 个权限`);

  // ============================================
  // 2. 创建角色及其权限关联
  // ============================================

  const rolePermissions = {
    ADMIN: permissions.map((p) => p.name), // 管理员拥有所有权限
    RECRUITER: [
      // 候选人管理 - 完整权限
      'candidates:view',
      'candidates:create',
      'candidates:update',
      'candidates:delete',
      // 职位管理 - 完整权限
      'jobs:view',
      'jobs:create',
      'jobs:update',
      'jobs:delete',
      'jobs:publish',
      'jobs:close',
      'jobs:archive',
      // 应聘流程 - 完整权限
      'applications:view',
      'applications:create',
      'applications:update',
      'applications:delete',
      'applications:updateStatus',
      // 面试管理 - 可查看和创建，但不能填反馈
      'interviews:view',
      'interviews:create',
      'interviews:update',
      'interviews:delete',
      'interviews:submitFeedback',
      // 用户管理 - 只能查看
      'users:view',
      // 数据分析 - 可查看所有分析
      'analytics:view',
      'analytics:funnel',
      'analytics:conversion',
      'analytics:timeCycle',
      'analytics:source',
      // 系统设置
      'system:viewSettings',
    ],
    INTERVIEWER: [
      // 只能查看，不能编辑
      'candidates:view',
      'jobs:view',
      'applications:view',
      'interviews:view',
      // 只能提交反馈
      'interviews:submitFeedback',
    ],
  };

  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    // 创建或更新角色
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} 角色`,
      },
    });

    // 删除现有的权限关联（避免重复）
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // 重新创建权限关联
    for (const permissionName of permissionNames) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName as string },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }

    console.log(`✅ 创建角色 ${roleName}，包含 ${permissionNames.length} 个权限`);
  }

  // ============================================
  // 3. 创建默认测试账号
  // ============================================
  const bcrypt = require('bcryptjs');
  const defaultPassword = await bcrypt.hash('admin123', 10);

  const defaultUsers = [
    {
      email: 'admin@gametalent.os',
      name: '系统管理员',
      password: defaultPassword,
      role: 'ADMIN' as const,
      department: '技术部',
      title: '系统管理员',
    },
    {
      email: 'recruiter@gametalent.os',
      name: '张HR',
      password: defaultPassword,
      role: 'RECRUITER' as const,
      department: '人力资源部',
      title: '招聘专员',
    },
    {
      email: 'interviewer@gametalent.os',
      name: '李技术',
      password: defaultPassword,
      role: 'INTERVIEWER' as const,
      department: '技术部',
      title: '资深服务器开发',
    },
  ];

  for (const userData of defaultUsers) {
    // 创建或更新用户
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        password: userData.password,
        role: userData.role,
        department: userData.department,
        title: userData.title,
        status: 'ACTIVE',
      },
      create: {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role,
        status: 'ACTIVE',
        department: userData.department,
        title: userData.title,
      },
    });

    // 关联角色
    const role = await prisma.role.findUnique({
      where: { name: userData.role },
    });

    if (role) {
      await prisma.userRoleMapping.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }

    console.log(`✅ 创建用户 ${userData.email} (${userData.role})`);
  }

  console.log('');
  console.log('🎉 认证与权限数据初始化完成！');
  console.log('');
  console.log('📝 默认测试账号：');
  console.log('================================================');
  console.log('角色'.padEnd(15) + '姓名'.padEnd(15) + '邮箱');
  console.log('================================================');
  console.log('ADMIN'.padEnd(15) + '系统管理员'.padEnd(15) + 'admin@gametalent.os');
  console.log('RECRUITER'.padEnd(15) + '张HR'.padEnd(15) + 'recruiter@gametalent.os');
  console.log('INTERVIEWER'.padEnd(15) + '李技术'.padEnd(15) + 'interviewer@gametalent.os');
  console.log('================================================');
  console.log('默认密码：admin123');
  console.log('');

  // 返回统计信息
  const [permissionCount, roleCount, userCount] = await Promise.all([
    prisma.permission.count(),
    prisma.role.count(),
    prisma.user.count(),
  ]);

  return {
    permissions: permissionCount,
    roles: roleCount,
    users: userCount,
  };
}
