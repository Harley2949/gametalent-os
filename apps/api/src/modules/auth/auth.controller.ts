import { Controller, Post, Body, Get, UseGuards, Request, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    console.log('[AuthController] Constructor called, authService:', !!authService);
  }

  @Post('login')
  @ApiOperation({ summary: '使用邮箱和密码登录' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    console.log('[AuthController] 收到登录请求:', loginDto.email);
    const result = await this.authService.login(loginDto);
    console.log('[AuthController] 登录成功，token长度:', result.access_token.length);

    // 🔒 安全改进：使用 httpOnly Cookie 存储 token
    res.cookie('auth_token', result.access_token, {
      httpOnly: true, // 防止 XSS 攻击
      secure: process.env.NODE_ENV === 'production', // 生产环境使用 HTTPS
      sameSite: 'strict', // 防止 CSRF 攻击
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
      path: '/',
    });

    // 返回用户信息（不返回 token）
    return res.status(HttpStatus.OK).json({
      user: result.user,
      message: '登录成功',
    });
  }

  @Post('register')
  @ApiOperation({ summary: '注册新用户' })
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.register(registerDto);

    // 🔒 安全改进：使用 httpOnly Cookie 存储 token
    res.cookie('auth_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(HttpStatus.CREATED).json({
      user: result.user,
      message: '注册成功',
    });
  }

  @Post('logout')
  @ApiOperation({ summary: '登出' })
  async logout(@Res() res: Response) {
    // 清除 Cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.status(HttpStatus.OK).json({
      message: '登出成功',
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req) {
    return this.authService.me(req.user.userId);
  }
}
