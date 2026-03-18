import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkExperienceService } from './work-experience.service';
import { CreateWorkExperienceDto, UpdateWorkExperienceDto, QueryWorkExperienceDto } from './dto/work-experience.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('work-experience')
@Controller('work-experience')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class WorkExperienceController {
  constructor(private readonly workExperienceService: WorkExperienceService) {}

  /**
   * 创建工作经历
   */
  @Post()
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '创建工作经历' })
  async create(@Body() createDto: CreateWorkExperienceDto) {
    return this.workExperienceService.create(createDto);
  }

  /**
   * 查询所有工作经历
   */
  @Get()
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '查询所有工作经历' })
  async findAll(@Query() query: QueryWorkExperienceDto) {
    return this.workExperienceService.findAll(query);
  }

  /**
   * 查询单个工作经历
   */
  @Get(':id')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '查询单个工作经历' })
  async findOne(@Param('id') id: string) {
    return this.workExperienceService.findOne(id);
  }

  /**
   * 更新工作经历
   */
  @Put(':id')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '更新工作经历' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateWorkExperienceDto) {
    return this.workExperienceService.update(id, updateDto);
  }

  /**
   * 删除工作经历
   */
  @Delete(':id')
  @RequirePermissions('candidates:delete')
  @ApiOperation({ summary: '删除工作经历' })
  async remove(@Param('id') id: string) {
    return this.workExperienceService.remove(id);
  }

  /**
   * 获取候选人的所有工作经历
   */
  @Get('candidate/:candidateId')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '获取候选人的所有工作经历' })
  async findByCandidate(@Param('candidateId') candidateId: string) {
    return this.workExperienceService.findByCandidate(candidateId);
  }

  /**
   * 批量创建工作经历
   */
  @Post('batch/:candidateId')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '批量创建工作经历' })
  async batchCreate(
    @Param('candidateId') candidateId: string,
    @Body() createDtos: CreateWorkExperienceDto[],
  ) {
    return this.workExperienceService.batchCreate(candidateId, createDtos);
  }

  /**
   * 按技能搜索工作经历
   */
  @Get('skill/:skill')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '按技能搜索工作经历' })
  async findBySkill(@Param('skill') skill: string) {
    return this.workExperienceService.findBySkill(skill);
  }
}
