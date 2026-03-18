import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 权限守卫
 *
 * 检查用户是否具有所需的权限
 * 通过用户的角色关联的权限来判断
 *
 * @example
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @RequirePermissions('candidates:create')
 * async create() {}
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取所需的权限
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    // 如果没有指定权限要求，则允许访问
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 从请求中获取用户信息
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 检查用户是否登录
    if (!user || !user.userId) {
      return false;
    }

    try {
      // 获取用户的所有角色
      const roleMappings = await this.prisma.userRoleMapping.findMany({
        where: { userId: user.userId },
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
      });

      // 收集用户的所有权限
      const userPermissions = new Set<string>();
      for (const rm of roleMappings) {
        for (const rp of rm.role.permissions) {
          userPermissions.add(rp.permission.name);
        }
      }

      // 检查是否拥有所需的所有权限
      return requiredPermissions.every((permission) =>
        userPermissions.has(permission),
      );
    } catch (error) {
      // 数据库查询失败，拒绝访问
      return false;
    }
  }
}
