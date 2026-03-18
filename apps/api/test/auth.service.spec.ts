/**
 * 认证服务单元测试
 *
 * 测试用户登录、注册、Token 验证等功能
 */

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let prisma: PrismaService;

  // 测试用户数据
  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456', // bcrypt hash of 'password123'
    name: '测试用户',
    role: Role.RECRUITER,
    isActive: true,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('应该成功验证有效的用户凭据', async () => {
      const mockUser = {
        ...testUser,
        password: await bcrypt.hash('password123', 10),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('应该在密码错误时抛出 UnauthorizedException', async () => {
      const mockUser = {
        ...testUser,
        password: await bcrypt.hash('password123', 10),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as any);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('应该在用户不存在时抛出 UnauthorizedException', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('应该在用户被禁用时抛出 UnauthorizedException', async () => {
      const inactiveUser = {
        ...testUser,
        isActive: false,
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(inactiveUser as any);

      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('应该成功登录并返回 access token', async () => {
      const mockUser = {
        ...testUser,
        password: await bcrypt.hash('password123', 10),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-jwt-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('应该在凭据无效时抛出 UnauthorizedException', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: '新用户',
        role: Role.RECRUITER,
      };

      const hashedPassword = await bcrypt.hash('password123', 10);

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue({
        id: 'new-user-id',
        ...registerDto,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-jwt-token');

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('newuser@example.com');
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: expect.any(String), // bcrypt hash
        name: '新用户',
        role: Role.RECRUITER,
      });
    });

    it('应该在邮箱已存在时抛出错误', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: '已存在用户',
        role: Role.RECRUITER,
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(testUser as any);

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe('verifyToken', () => {
    it('应该成功验证有效的 token', async () => {
      const mockPayload = { sub: 'test-user-id', email: 'test@example.com' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);
      jest.spyOn(usersService, 'findById').mockResolvedValue({
        ...testUser,
        id: mockPayload.sub,
      } as any);

      const result = await service.verifyToken('valid-jwt-token');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
    });

    it('应该在 token 无效时抛出 UnauthorizedException', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new UnauthorizedException('Invalid token');
      });

      await expect(service.verifyToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('应该在用户不存在时抛出 UnauthorizedException', async () => {
      const mockPayload = { sub: 'nonexistent-user-id', email: 'test@example.com' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);
      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      await expect(service.verifyToken('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
