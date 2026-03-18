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
  Request,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../auth';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  QueryApplicationsDto,
  UpdateStatusDto,
  ScreenApplicationDto,
} from './dto';

@ApiTags('applications')
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(
    private applicationsService: ApplicationsService,
    private prisma: PrismaService,
  ) {}

  /**
   * 获取应聘列表
   */
  @Get()
  @RequirePermissions('applications:view')
  @ApiOperation({ summary: '获取应聘列表（支持筛选、分页）' })
  findAll(@Query() query: QueryApplicationsDto) {
    return this.applicationsService.findAll(query);
  }

  /**
   * 获取看板视图数据
   */
  @Get('kanban')
  @RequirePermissions('applications:view')
  @ApiOperation({ summary: '获取看板视图数据（按状态分组）' })
  getKanbanData(@Query('jobId') jobId?: string) {
    return this.applicationsService.getKanbanData(jobId);
  }

  /**
   * 获取应聘统计
   */
  @Get('stats/summary')
  @RequirePermissions('applications:view')
  @ApiOperation({ summary: '获取应聘统计数据' })
  getStatistics(@Query('jobId') jobId?: string) {
    return this.applicationsService.getStatistics(jobId);
  }

  /**
   * 获取应聘详情
   */
  @Get(':id')
  @RequirePermissions('applications:view')
  @ApiOperation({ summary: '获取应聘详情' })
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  /**
   * 创建应聘记录
   */
  @Post()
  @RequirePermissions('applications:create')
  @ApiOperation({ summary: '创建应聘记录' })
  create(@Body() data: CreateApplicationDto) {
    return this.applicationsService.create(data);
  }

  /**
   * 更新应聘信息
   */
  @Put(':id')
  @RequirePermissions('applications:update')
  @ApiOperation({ summary: '更新应聘信息' })
  update(@Param('id') id: string, @Body() data: UpdateApplicationDto) {
    return this.applicationsService.update(id, data);
  }

  /**
   * 删除应聘记录
   */
  @Delete(':id')
  @RequirePermissions('applications:delete')
  @ApiOperation({ summary: '删除应聘记录' })
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }

  /**
   * 更新应聘状态
   */
  @Put(':id/status')
  @RequirePermissions('applications:updateStatus')
  @ApiOperation({ summary: '更新应聘状态' })
  updateStatus(
    @Param('id') id: string,
    @Body() data: UpdateStatusDto,
    @Request() req,
  ) {
    return this.applicationsService.updateStatus(id, data, req.user.userId);
  }

  /**
   * 筛选候选人
   */
  @Post(':id/screen')
  @RequirePermissions('applications:updateStatus')
  @ApiOperation({ summary: '筛选候选人' })
  screen(@Param('id') id: string, @Body() data: ScreenApplicationDto, @Request() req) {
    return this.applicationsService.screen(id, data, req.user.userId);
  }

  /**
   * 批量更新状态
   */
  @Post('batch/status')
  @RequirePermissions('applications:updateStatus')
  @ApiOperation({ summary: '批量更新应聘状态' })
  batchUpdateStatus(
    @Body('ids') ids: string[],
    @Body('status') status: string,
    @Request() req,
  ) {
    return this.applicationsService.batchUpdateStatus(ids, status as any, req.user.userId);
  }

  /**
   * 直接数据库操作：获取所有应聘记录（绕过服务层）
   */
  @Get('direct')
  @Public()
  @ApiOperation({ summary: '直接获取应聘记录（临时修复用）' })
  async getDirectApplications() {
    try {
      const applications = await this.prisma.application.findMany({
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              department: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return applications;
    } catch (error) {
      console.error('直接获取应聘记录失败:', error);
      throw error;
    }
  }

  /**
   * 直接数据库操作：创建应聘记录（绕过服务层）
   */
  @Post('direct')
  @Public()
  @ApiOperation({ summary: '直接创建应聘记录（临时修复用）' })
  async createDirectApplication(@Body() data: CreateApplicationDto) {
    try {
      console.log('🔧 直接创建应聘记录 - 绕过服务层');
      console.log('📥 接收数据:', data);

      // 验证必填字段
      if (!data.jobId || !data.candidateId) {
        throw new Error('缺少必填字段: jobId 和 candidateId');
      }

      // 检查是否已存在相同的应聘记录
      const existing = await this.prisma.application.findFirst({
        where: {
          jobId: data.jobId,
          candidateId: data.candidateId,
        },
      });

      if (existing) {
        throw new Error('该候选人已应聘此职位');
      }

      // 验证职位是否存在
      const job = await this.prisma.job.findUnique({
        where: { id: data.jobId },
      });

      if (!job) {
        throw new Error('职位不存在');
      }

      // 验证候选人是否存在
      const candidate = await this.prisma.candidate.findUnique({
        where: { id: data.candidateId },
      });

      if (!candidate) {
        throw new Error('候选人不存在');
      }

      // 创建应聘记录
      const application = await this.prisma.application.create({
        data: {
          jobId: data.jobId,
          candidateId: data.candidateId,
          status: 'APPLIED',
          source: data.source || 'DIRECT',
          transparencyLevel: data.transparencyLevel || 'STANDARD',
          coverLetter: data.coverLetter,
          appliedAt: new Date(),
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              status: true,
              department: true,
            },
          },
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      console.log('✅ 应聘记录创建成功:', application);

      // 返回完整的应用记录
      return application;
    } catch (error) {
      console.error('❌ 直接创建应聘记录失败:', error);
      throw error;
    }
  }
}
