import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Roles, RequirePermissions } from './decorators';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'gametalent-secret-key-change-in-production',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    }),
  ],
  providers: [
    AuthService,
    // Temporarily disable strategies to isolate issue
    // JwtStrategy,
    // LocalStrategy,
    RolesGuard,
    PermissionsGuard,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}
