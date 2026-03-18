import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ResumeUploadController } from './resume-upload.controller';
import { ResumeUploadService } from './resume-upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiModule } from '../ai/ai.module';
import { ResumeParserService } from '../ai/resume-parser.service';
import { CandidatesModule } from '../candidates/candidates.module';
import * as path from 'path';
import * as fs from 'fs';

// 确保 uploads 目录存在
const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`✅ 创建上传目录: ${uploadsDir}`);
}

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(), // 使用内存存储,使 file.buffer 可用
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
        ];

        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error(`不支持的文件类型：${file.mimetype}。仅支持 PDF 和图片（JPEG, PNG）`), false);
        }
      },
    }),
    AiModule,
    CandidatesModule,
  ],
  controllers: [ResumeUploadController],
  providers: [ResumeUploadService, PrismaService, ResumeParserService],
  exports: [ResumeUploadService],
})
export class ResumeUploadModule {}
