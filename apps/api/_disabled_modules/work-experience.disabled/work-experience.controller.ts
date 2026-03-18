import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkExperienceService } from './work-experience.service';
import {
  CreateWorkExperienceDto,
  UpdateWorkExperienceDto,
  QueryWorkExperiencesDto,
  WorkExperienceResponseDto,
} from './dto';

@ApiTags('WorkExperience - 工作经历管理')
@Controller('work-experiences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkExperienceController {
  constructor(private readonly workExperienceService: WorkExperienceService) {}

  /**
   * 创建工作经历
   */
  @Post()
  @ApiOperation({ summary: '创建工作经历' })
  @ApiResponse({ status: 201, type: WorkExperienceResponseDto })
  create(@Body() createWorkExperienceDto: CreateWorkExperienceDto) {
    return this.workExperienceService.create(createWorkExperienceDto);
  }

  /**
   * 批量创建工作经历
   */
  @Post('batch')
  @ApiOperation({ summary: '批量创建工作经历' })
  @ApiResponse({ status: 201, type: [WorkExperienceResponseDto] })
  createBatch(@Body() dtos: CreateWorkExperienceDto[]) {
    return this.workExperienceService.createBatch(dtos);
  }

  /**
   * 查询工作经历列表
   */
  @Get()
  @ApiOperation({ summary: '查询工作经历列表' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/schemas/WorkExperienceResponseDto' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: QueryWorkExperiencesDto) {
    return this.workExperienceService.findAll(query);
  }

  /**
   * 查询单条工作经历
   */
  @Get(':id')
  @ApiOperation({ summary: '查询单条工作经历' })
  @ApiResponse({ status: 200, type: WorkExperienceResponseDto })
  findOne(@Param('id') id: string) {
    return this.workExperienceService.findOne(id);
  }

  /**
   * 更新工作经历
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新工作经历' })
  @ApiResponse({ status: 200, type: WorkExperienceResponseDto })
  update(@Param('id') id: string, @Body() updateWorkExperienceDto: UpdateWorkExperienceDto) {
    return this.workExperienceService.update(id, updateWorkExperienceDto);
  }

  /**
   * 删除工作经历
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除工作经历' })
  @ApiResponse({ status: 200, schema: { type: 'object', properties: { message: { type: 'string' } } } })
  remove(@Param('id') id: string) {
    return this.workExperienceService.remove(id);
  }

  /**
   * 获取候选人的所有工作经历
   */
  @Get('candidate/:candidateId')
  @ApiOperation({ summary: '获取候选人的所有工作经历' })
  @ApiResponse({ status: 200, type: [WorkExperienceResponseDto] })
  findByCandidate(@Param('candidateId') candidateId: string) {
    return this.workExperienceService.findByCandidate(candidateId);
  }

  /**
   * 按公司筛选候选人 ⭐ 核心功能
   */
  @Get('filter/by-company')
  @ApiOperation({ summary: '按公司筛选候选人' })
  @ApiResponse({ status: 200, type: [Object] })
  findCandidatesByCompany(
    @Query('companyId') companyId: string,
    @Query('includePast') includePast?: string,
  ) {
    return this.workExperienceService.findCandidatesByCompany(
      companyId,
      includePast === 'false' ? false : true,
    );
  }

  /**
   * 查询在目标公司在职的候选人
   */
  @Get('filter/target-employees')
  @ApiOperation({ summary: '查询在目标公司在职的候选人' })
  @ApiResponse({ status: 200, type: [WorkExperienceResponseDto] })
  findCurrentTargetEmployees() {
    return this.workExperienceService.findCurrentTargetEmployees();
  }
}
