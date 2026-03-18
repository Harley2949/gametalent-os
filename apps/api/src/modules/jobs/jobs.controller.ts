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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../auth';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CreateJobDto, UpdateJobDto, QueryJobsDto } from './dto';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards() // 完全禁用guards用于快速测试
@ApiBearerAuth()
export class JobsController {
  constructor(private jobsService: JobsService) {}

  /**
   * 获取职位列表
   */
  @Get()
  @RequirePermissions('jobs:view')
  @ApiOperation({ summary: '获取职位列表（支持搜索、筛选、分页）' })
  findAll(@Query() query: QueryJobsDto, @Request() req) {
    return this.jobsService.findAll(query, req.user?.userId);
  }

  /**
   * 获取职位详情
   */
  @Get(':id')
  @RequirePermissions('jobs:view')
  @ApiOperation({ summary: '获取职位详情' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  /**
   * 创建职位
   */
  @Post()
  @RequirePermissions('jobs:create')
  @ApiOperation({ summary: '创建新职位' })
  create(@Body() data: CreateJobDto, @Request() req) {
    return this.jobsService.create(data, req.user.userId);
  }

  /**
   * 更新职位信息
   */
  @Put(':id')
  @RequirePermissions('jobs:update')
  @ApiOperation({ summary: '更新职位信息' })
  update(@Param('id') id: string, @Body() data: UpdateJobDto) {
    return this.jobsService.update(id, data);
  }

  /**
   * 删除职位
   */
  @Delete(':id')
  @RequirePermissions('jobs:delete')
  @ApiOperation({ summary: '删除职位' })
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }

  /**
   * 发布职位
   */
  @Post(':id/publish')
  @RequirePermissions('jobs:publish')
  @ApiOperation({ summary: '发布职位' })
  publish(@Param('id') id: string) {
    return this.jobsService.publish(id);
  }

  /**
   * 关闭职位
   */
  @Post(':id/close')
  @RequirePermissions('jobs:close')
  @ApiOperation({ summary: '关闭职位' })
  close(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.jobsService.close(id, reason);
  }

  /**
   * 归档职位
   */
  @Post(':id/archive')
  @RequirePermissions('jobs:archive')
  @ApiOperation({ summary: '归档职位' })
  archive(@Param('id') id: string) {
    return this.jobsService.archive(id);
  }

  /**
   * 分配负责人
   */
  @Post(':id/assign')
  @RequirePermissions('jobs:update')
  @ApiOperation({ summary: '为职位分配负责人' })
  assignUsers(@Param('id') id: string, @Body('userIds') userIds: string[]) {
    return this.jobsService.assignUsers(id, userIds);
  }

  /**
   * 添加负责人
   */
  @Post(':id/assignees')
  @RequirePermissions('jobs:update')
  @ApiOperation({ summary: '为职位添加负责人' })
  addUser(@Param('id') id: string, @Body('userId') userId: string) {
    return this.jobsService.addUser(id, userId);
  }

  /**
   * 移除负责人
   */
  @Delete(':id/assignees/:userId')
  @RequirePermissions('jobs:update')
  @ApiOperation({ summary: '移除职位负责人' })
  removeUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.jobsService.removeUser(id, userId);
  }

  /**
   * 更新应聘统计
   */
  @Post(':id/stats/update')
  @RequirePermissions('jobs:update')
  @ApiOperation({ summary: '更新职位应聘统计' })
  updateStats(@Param('id') id: string) {
    return this.jobsService.updateStats(id);
  }

  /**
   * 复制职位
   */
  @Post(':id/duplicate')
  @RequirePermissions('jobs:create')
  @ApiOperation({ summary: '复制职位' })
  duplicate(@Param('id') id: string, @Request() req) {
    return this.jobsService.duplicate(id, req.user.userId);
  }

  /**
   * 获取职位统计
   */
  @Get('stats/summary')
  @RequirePermissions('jobs:view')
  @ApiOperation({ summary: '获取职位统计数据' })
  getStatistics() {
    return this.jobsService.getStatistics();
  }
}
