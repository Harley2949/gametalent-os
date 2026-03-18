import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    console.log('[AuthService] Constructor called - AuthService instantiated');
  }

  async validateUser(email: string, password: string): Promise<any> {
    console.log('[AuthService validateUser] Looking up user:', email);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('[AuthService validateUser] User not found');
      return null;
    }

    console.log('[AuthService validateUser] User found, password length:', user.password?.length);
    console.log('[AuthService validateUser] Password preview:', user.password?.substring(0, 20));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('[AuthService validateUser] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    try {
      console.log('[AuthService] 开始登录验证:', loginDto.email);
      const user = await this.validateUser(loginDto.email, loginDto.password);

      if (!user) {
        console.log('[AuthService] 用户验证失败');
        throw new UnauthorizedException('邮箱或密码错误');
      }

      if (user.status !== 'ACTIVE') {
        console.log('[AuthService] 账户未激活:', user.status);
        throw new UnauthorizedException('账户未激活');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      // Generate token
      const token = this.jwtService.sign(payload);
      console.log('[AuthService] Token生成成功');

      // Update last login (try-catch to avoid blocking login)
      try {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        console.log('[AuthService] LastLoginAt更新成功');
      } catch (error) {
        console.warn('[AuthService] LastLoginAt更新失败（忽略）:', error);
      }

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      };
    } catch (error) {
      console.error('[AuthService] 登录失败:', error);
      throw error;
    }
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const userRole = registerDto.role || 'RECRUITER';

    // 查找对应的 Role 记录
    const roleRecord = await this.prisma.role.findFirst({
      where: { name: userRole },
    });

    if (!roleRecord) {
      throw new ConflictException('角色不存在');
    }

    // 创建用户和角色映射
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        role: userRole,
        status: 'ACTIVE',
        roleMappings: {
          create: {
            roleId: roleRecord.id,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
        department: true,
        title: true,
        phoneNumber: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }
}
