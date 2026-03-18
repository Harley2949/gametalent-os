import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  async login(@Body() loginDto: LoginDto) {
    console.log('[AuthController] 收到登录请求:', loginDto.email);
    const result = await this.authService.login(loginDto);
    console.log('[AuthController] 登录成功，token长度:', result.access_token.length);
    // 直接返回 token，不使用 cookie
    return result;
  }

  @Post('register')
  @ApiOperation({ summary: '注册新用户' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    // 直接返回 token，不使用 cookie
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req) {
    return this.authService.me(req.user.userId);
  }
}
