import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResumeUploadService } from './resume-upload.service';
import { ResumeStatus } from '@prisma/client';

@ApiTags('resume-upload')
@Controller('resume-upload')
@UseGuards() // 完全禁用guards用于快速测试
export class ResumeUploadController {
  constructor(private readonly resumeUploadService: ResumeUploadService) {}

  /**
   * 上传并解析简历
   */
  @Post('upload')
  @ApiOperation({ summary: '上传并解析简历（PDF/图片，最大5MB）' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile() file: any,
    @Body('candidateId') candidateId?: string,
    @Body('title') title?: string,
    @Body('isPrimary') isPrimary?: string,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const result = await this.resumeUploadService.uploadAndParse(file, {
      candidateId,
      title,
      isPrimary: isPrimary === 'true',
    });

    return {
      success: true,
      message: result.isNewCandidate ? '简历上传成功，已自动创建候选人' : '简历上传成功',
      data: result,
    };
  }

  /**
   * 批量上传简历
   */
  @Post('batch')
  @ApiOperation({ summary: '批量上传简历' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 10))
  async batchUploadResumes(@UploadedFiles() files: any[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const results = await Promise.allSettled(
      files.map(file => this.resumeUploadService.uploadAndParse(file, {}))
    );

    const success = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');

    return {
      success: true,
      message: `批量上传完成：${success.length} 个成功，${failed.length} 个失败`,
      data: {
        total: files.length,
        success: success.length,
        failed: failed.length,
        results: results.map((r, i) => ({
          fileName: files[i].originalname,
          status: r.status === 'fulfilled' ? 'success' : 'failed',
          data: r.status === 'fulfilled' ? r.value : null,
          error: r.status === 'rejected' ? r.reason.message : null,
        })),
      },
    };
  }

  /**
   * 获取解析状态
   */
  @Get('status/:resumeId')
  @ApiOperation({ summary: '获取简历解析状态' })
  async getParsingStatus(@Param('resumeId') resumeId: string) {
    const status = await this.resumeUploadService.getParsingStatus(resumeId);
    return {
      success: true,
      data: status,
    };
  }

  /**
   * 重新解析简历
   */
  @Put('reparse/:resumeId')
  @ApiOperation({ summary: '重新解析简历' })
  async reparseResume(@Param('resumeId') resumeId: string) {
    const result = await this.resumeUploadService.reparseResume(resumeId);
    return {
      success: true,
      message: '简历重新解析成功',
      data: result,
    };
  }

  /**
   * 上传简历到指定候选人
   */
  @Post('candidate/:candidateId')
  @ApiOperation({ summary: '为指定候选人上传简历' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadForCandidate(
    @Param('candidateId') candidateId: string,
    @UploadedFile() file: any,
    @Body('title') title?: string,
    @Body('isPrimary') isPrimary?: string,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const result = await this.resumeUploadService.uploadAndParse(file, {
      candidateId,
      title,
      isPrimary: isPrimary === 'true',
    });

    return {
      success: true,
      message: '简历上传成功',
      data: result,
    };
  }
}
