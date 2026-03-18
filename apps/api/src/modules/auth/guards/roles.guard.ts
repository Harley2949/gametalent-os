import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@gametalent/db';

/**
 * 角色守卫
 *
 * 检查用户是否具有所需的角色
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 * async delete() {}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取所需的角色
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    // 如果没有指定角色要求，则允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 从请求中获取用户信息
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 检查用户是否登录
    if (!user) {
      return false;
    }

    // 检查用户角色是否匹配
    return requiredRoles.some((role) => user.role === role);
  }
}
