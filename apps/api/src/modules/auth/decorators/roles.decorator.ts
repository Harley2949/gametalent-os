import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@gametalent/db';

/**
 * 角色装饰器
 *
 * 用于指定端点需要的角色
 *
 * @example
 * @Roles(UserRole.ADMIN, UserRole.HR)
 * @Post()
 * async create() {}
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

/**
 * ROLES_KEY 常量
 *
 * 用于在 Reflector 中获取角色元数据
 */
export const ROLES_KEY = 'roles';
