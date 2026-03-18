import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../auth';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermissions('users:view')
  @ApiOperation({ summary: '获取所有用户列表' })
  findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.usersService.findAll(Number(skip) || 0, Number(take) || 10);
  }

  @Get(':id')
  @RequirePermissions('users:view')
  @ApiOperation({ summary: '根据 ID 获取用户信息' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
