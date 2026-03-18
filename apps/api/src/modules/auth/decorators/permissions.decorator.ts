import { SetMetadata } from '@nestjs/common';

/**
 * 权限装饰器
 *
 * 用于指定端点需要的权限
 *
 * @example
 * @RequirePermissions('candidates:create', 'candidates:update')
 * @Post()
 * async create() {}
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

/**
 * PERMISSIONS_KEY 常量
 *
 * 用于在 Reflector 中获取权限元数据
 */
export const PERMISSIONS_KEY = 'permissions';
