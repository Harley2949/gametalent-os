import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../auth';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CreateCandidateDto, UpdateCandidateDto, QueryCandidatesDto } from './dto';
import { CandidateStatus } from '@prisma/client';

@ApiTags('candidates')
@Controller('candidates')
@UseGuards() // 完全禁用guards用于快速测试
@ApiBearerAuth()
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  /**
   * 获取候选人列表
   */
  @Get()
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '获取候选人列表（支持搜索、筛选、分页）' })
  findAll(@Query() query: QueryCandidatesDto) {
    return this.candidatesService.findAll(query);
  }

  /**
   * 获取候选人详情
   */
  @Get(':id')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '获取候选人详情' })
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  /**
   * 获取候选人阶段变更历史
   */
  @Get(':id/stage-history')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '获取候选人阶段变更历史' })
  getStageHistory(@Param('id') id: string) {
    return this.candidatesService.getStageHistory(id);
  }

  /**
   * 创建候选人
   */
  @Post()
  @RequirePermissions('candidates:create')
  @ApiOperation({ summary: '创建新候选人' })
  create(@Body() data: CreateCandidateDto) {
    return this.candidatesService.create(data);
  }

  /**
   * 更新候选人信息
   */
  @Put(':id')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '更新候选人信息' })
  update(@Param('id') id: string, @Body() data: UpdateCandidateDto) {
    return this.candidatesService.update(id, data);
  }

  /**
   * 删除候选人（软删除）
   */
  @Delete(':id')
  @RequirePermissions('candidates:delete')
  @ApiOperation({ summary: '删除候选人（软删除）' })
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }

  /**
   * 永久删除候选人
   */
  @Delete(':id/permanent')
  @RequirePermissions('candidates:delete')
  @ApiOperation({ summary: '永久删除候选人' })
  permanentlyDelete(@Param('id') id: string) {
    return this.candidatesService.permanentlyDelete(id);
  }

  /**
   * 添加标签
   */
  @Post(':id/tags')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '为候选人添加标签' })
  addTags(@Param('id') id: string, @Body('tags') tags: string[]) {
    return this.candidatesService.addTags(id, tags);
  }

  /**
   * 移除标签
   */
  @Delete(':id/tags')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '移除候选人标签' })
  removeTags(@Param('id') id: string, @Body('tags') tags: string[]) {
    return this.candidatesService.removeTags(id, tags);
  }

  /**
   * 更新候选人状态
   */
  @Put(':id/status')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '更新候选人状态' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: CandidateStatus,
  ) {
    return this.candidatesService.updateStatus(id, status);
  }

  /**
   * 获取所有标签
   *
   * 查询参数：
   * - limit: 返回标签数量限制（默认100）
   * - minCount: 最小出现次数（默认1）
   * - excludeArchived: 是否排除已归档候选人（默认true）
   */
  @Get('tags/all')
  @RequirePermissions('candidates:view')
  @ApiOperation({
    summary: '获取所有标签及使用统计',
    description: '返回按使用次数排序的标签列表，支持自定义过滤条件'
  })
  getAllTags(
    @Query('limit') limit?: string,
    @Query('minCount') minCount?: string,
    @Query('excludeArchived') excludeArchived?: string,
  ) {
    return this.candidatesService.getAllTags({
      limit: limit ? parseInt(limit, 10) : undefined,
      minCount: minCount ? parseInt(minCount, 10) : undefined,
      excludeArchived: excludeArchived !== 'false', // 默认 true
    });
  }

  /**
   * 上传简历
   */
  @Post(':id/resumes')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '为候选人上传简历' })
  uploadResume(
    @Param('id') id: string,
    @Body() data: {
      fileName: string;
      fileUrl: string;
      fileSize: number;
      fileType: string;
      title?: string;
      isPrimary?: boolean;
    },
  ) {
    return this.candidatesService.uploadResume(
      id,
      {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType,
      },
      data.title,
      data.isPrimary,
    );
  }

  /**
   * 批量导入候选人
   */
  @Post('batch')
  @RequirePermissions('candidates:create')
  @ApiOperation({ summary: '批量导入候选人' })
  batchImport(@Body('candidates') candidates: CreateCandidateDto[]) {
    return this.candidatesService.batchImport(candidates);
  }

  /**
   * 获取候选人统计
   */
  @Get('stats/summary')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '获取候选人统计数据' })
  getStatistics() {
    return this.candidatesService.getStatistics();
  }
}
