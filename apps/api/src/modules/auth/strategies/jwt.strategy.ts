import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const secret = config?.get('JWT_SECRET') || 'gametalent-secret-key-change-in-production';

    // 🔒 安全改进：从 Cookie 读取 token，而不是 Authorization header
    const cookieExtractor = (request: Request) => {
      let token = null;

      if (request && request.cookies) {
        token = request.cookies['auth_token'];
      }

      // 兼容旧的 Authorization header 方式（可选）
      if (!token && request.headers['authorization']) {
        token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
      }

      return token;
    };

    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException();
    }

    return { userId: user.id, email: user.email, role: user.role };
  }
}
