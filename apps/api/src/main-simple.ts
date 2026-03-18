import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Module, Controller, Get, Post, UseInterceptors, UploadedFile, Body, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterModule } from '@nestjs/platform-express/multer/multer.module';
import { PrismaClient } from '@prisma/client';

// 数据库 URL
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://gametalent:gametalent_password@127.0.0.1:5432/gametalent_os?schema=public';

const prisma = new PrismaClient();

// 简化的控制器
@Controller('resume-upload')
class ResumeUploadController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile() file: any,
    @Body('candidateId') candidateId?: string,
  ) {
    if (!file) {
      return { success: false, message: '请选择要上传的文件' };
    }

    try {
      // 1. 提取 PDF 内容
      const buffer = file.buffer;
      let text = '';

      if (file.mimetype === 'application/pdf') {
        // pdf-parse 2.x 的正确导入方式
        const pdfParse = await import('pdf-parse');
        const data = await (pdfParse as any).default(buffer);
        text = data.text;
      } else {
        text = '[图片文件 - 需要 OCR 解析]';
      }

      // 2. 创建或查找候选人（简化版）
      let candidate;
      let isNewCandidate = false;

      if (candidateId) {
        candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
      }

      if (!candidate) {
        // 从文本中提取邮箱（简单正则）
        const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
        const email = emailMatch ? emailMatch[0] : `temp_${Date.now()}@example.com`;

        try {
          candidate = await prisma.candidate.create({
            data: {
              email,
              name: '待完善',
              source: 'UPLOAD',
              status: 'ACTIVE',
            },
          });
          isNewCandidate = true;
          console.log('✅ 创建新候选人:', candidate.id);
        } catch (error: any) {
          // 邮箱重复，查找现有候选人
          if (error.code === 'P2002') {
            console.log('📧 邮箱已存在，查找现有候选人...');
            candidate = await prisma.candidate.findUnique({ where: { email } });
            if (candidate) {
              console.log('✅ 找到现有候选人:', candidate.id);
            } else {
              throw new Error('邮箱重复但找不到候选人记录');
            }
          } else {
            throw error;
          }
        }
      }

      // 3. 创建简历记录
      const resume = await prisma.resume.create({
        data: {
          candidateId: candidate.id,
          title: file.originalname,
          fileName: file.originalname,
          fileUrl: `/uploads/resumes/${file.originalname}`,
          fileSize: file.size,
          fileType: file.mimetype,
          rawData: text,
          rawText: text,
          parsedData: { text, extractedAt: new Date().toISOString() },
          skills: [],
          status: 'READY',
          parsedAt: new Date(),
          isPrimary: true,
        },
      });

      return {
        success: true,
        message: '简历上传成功',
        data: {
          resumeId: resume.id,
          candidateId: candidate.id,
          isNewCandidate: isNewCandidate,
        },
      };
    } catch (error) {
      console.error('上传错误:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '上传失败',
      };
    }
  }

  @Get('status/:resumeId')
  async getParsingStatus(@Param('resumeId') resumeId: string) {
    console.log('📊 查询简历状态, resumeId:', resumeId);

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });

    if (!resume) {
      return { success: false, message: '简历不存在' };
    }

    return {
      success: true,
      data: {
        resumeId: resume.id,
        status: resume.status,
        progress: resume.status === 'READY' ? 100 : 0,
        parsedData: resume.parsedData,
      },
    };
  }
}

@Controller('health')
class HealthController {
  @Get()
  health() {
    return { status: 'ok', message: 'GameTalent OS API (简化版)' };
  }
}

// 简化的模块
@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [ResumeUploadController, HealthController],
})
class SimpleAppModule {}

// 启动函数
async function bootstrap() {
  const app = await NestFactory.create(SimpleAppModule);

  // Enable CORS - 允许多个端口
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
    ],
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // API prefix
  app.setGlobalPrefix('api', { exclude: ['health'] });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('GameTalent OS API (简化版)')
    .setDescription('简历上传测试服务')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = 3006;
  await app.listen(port);

  console.log(`================================================`);
  console.log(`🚀 GameTalent OS API (简化版) 已启动!`);
  console.log(`📍 服务地址: http://localhost:${port}`);
  console.log(`📚 API 文档: http://localhost:${port}/api/docs`);
  console.log(`================================================`);
}

bootstrap().catch(console.error);
