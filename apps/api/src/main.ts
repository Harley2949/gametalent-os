// ⚠️ 重要：必须在导入任何模块之前设置 DATABASE_URL
// 因为 PrismaService 在模块导入时就会被实例化
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://gametalent:gametalent_password@127.0.0.1:5432/gametalent_os?schema=public&client_encoding=UTF8';

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // 🔒 安全改进：添加 cookie-parser 中间件
    app.use(cookieParser());

    // 设置 UTF-8 编码支持，防止中文乱码
    app.use((req, res, next) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      next();
    });

    // 应用全局异常过滤器
    app.useGlobalFilters(new AllExceptionsFilter());

    // Enable CORS - 支持本地开发的不同 host 格式
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000', // ✅ 添加 127.0.0.1 支持
        'http://localhost:3001',
        'http://127.0.0.1:3001', // ✅ 添加 127.0.0.1 支持
        'http://localhost:3002',
        'http://127.0.0.1:3002', // ✅ 添加 127.0.0.1 支持
        process.env.FRONTEND_URL
      ].filter(Boolean),
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // API prefix
    app.setGlobalPrefix('api');

    // 静态文件服务 - 提供上传的文件访问
    const uploadsPath = require('path').join(process.cwd(), 'uploads');
    app.use('/uploads', express.static(uploadsPath));
    console.log(`✅ 静态文件服务已启用: /uploads -> ${uploadsPath}`);

    // Swagger documentation - 临时禁用 due to metadata issues
    // const config = new DocumentBuilder()
    //   .setTitle('GameTalent OS API')
    //   .setDescription('游戏行业 AI 原生智能招聘系统')
    //   .setVersion('0.1.0')
    //   .addBearerAuth()
    //   .addTag('auth', '用户认证接口')
    //   .addTag('users', '用户管理')
    //   .addTag('candidates', '候选人管理')
    //   .addTag('jobs', '职位管理')
    //   .addTag('applications', '求职申请管理')
    //   .addTag('interviews', '面试管理')
    //   .addTag('feedback', '反馈管理')
    //   .addTag('ai', 'AI 智能匹配与分析')
    //   .build();

    // const document = SwaggerModule.createDocument(app, config);
    // SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3006;
    await app.listen(port);

    console.log(`GameTalent OS API 服务已启动: http://localhost:${port}`);
    // console.log(`API 文档地址: http://localhost:${port}/api/docs`);
    console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    const err = error as Error;
    console.error('❌ 后端启动失败:', err.message);
    console.error('错误堆栈:', err.stack);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Bootstrap 失败:', error);
  process.exit(1);
});
