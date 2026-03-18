import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EducationService } from './education.service';
import { CreateEducationDto, UpdateEducationDto, QueryEducationDto } from './dto/education.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('education')
@Controller('education')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  /**
   * 创建教育经历
   */
  @Post()
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '创建教育经历' })
  async create(@Body() createDto: CreateEducationDto) {
    return this.educationService.create(createDto);
  }

  /**
   * 查询所有教育经历
   */
  @Get()
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '查询所有教育经历' })
  async findAll(@Query() query: QueryEducationDto) {
    return this.educationService.findAll(query);
  }

  /**
   * 查询单个教育经历
   */
  @Get(':id')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '查询单个教育经历' })
  async findOne(@Param('id') id: string) {
    return this.educationService.findOne(id);
  }

  /**
   * 更新教育经历
   */
  @Put(':id')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '更新教育经历' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateEducationDto) {
    return this.educationService.update(id, updateDto);
  }

  /**
   * 删除教育经历
   */
  @Delete(':id')
  @RequirePermissions('candidates:delete')
  @ApiOperation({ summary: '删除教育经历' })
  async remove(@Param('id') id: string) {
    return this.educationService.remove(id);
  }

  /**
   * 获取候选人的所有教育经历
   */
  @Get('candidate/:candidateId')
  @RequirePermissions('candidates:view')
  @ApiOperation({ summary: '获取候选人的所有教育经历' })
  async findByCandidate(@Param('candidateId') candidateId: string) {
    return this.educationService.findByCandidate(candidateId);
  }

  /**
   * 批量创建教育经历
   */
  @Post('batch/:candidateId')
  @RequirePermissions('candidates:update')
  @ApiOperation({ summary: '批量创建教育经历' })
  async batchCreate(
    @Param('candidateId') candidateId: string,
    @Body() createDtos: CreateEducationDto[],
  ) {
    return this.educationService.batchCreate(candidateId, createDtos);
  }
}
