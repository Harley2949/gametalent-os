import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @ApiProperty({ example: 'admin@gametalent.os', description: '用户邮箱' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ example: 'admin123', description: '用户密码' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少为 6 位' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'john.doe@gametalent.os', description: '用户邮箱' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ example: '张三', description: '用户姓名' })
  @IsString({ message: '姓名必须是字符串' })
  name: string;

  @ApiProperty({ example: 'password123', description: '用户密码' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少为 6 位' })
  password: string;

  @ApiProperty({ enum: UserRole, example: 'RECRUITER', required: false, description: '用户角色' })
  @IsEnum(UserRole, { message: '角色必须是有效的枚举值' })
  @IsOptional()
  role?: UserRole;
}
