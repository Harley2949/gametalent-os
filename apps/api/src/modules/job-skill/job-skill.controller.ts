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
import { JobSkillService } from './job-skill.service';
import {
  CreateJobSkillDto,
  UpdateJobSkillDto,
  QueryJobSkillsDto,
  JobSkillResponseDto,
} from './dto';

@ApiTags('JobSkill - 职位技能要求管理')
@Controller('job-skills')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobSkillController {
  constructor(private readonly jobSkillService: JobSkillService) {}

  /**
   * 创建职位技能要求
   */
  @Post()
  @ApiOperation({ summary: '创建职位技能要求' })
  @ApiResponse({ status: 201, type: JobSkillResponseDto })
  create(@Body() createJobSkillDto: CreateJobSkillDto) {
    return this.jobSkillService.create(createJobSkillDto);
  }

  /**
   * 批量创建职位技能要求
   */
  @Post('batch')
  @ApiOperation({ summary: '批量创建职位技能要求' })
  @ApiResponse({ status: 201, type: [JobSkillResponseDto] })
  createBatch(
    @Body() body: { jobId: string; skills: Omit<CreateJobSkillDto, 'jobId'>[] },
  ) {
    return this.jobSkillService.createBatch(body.jobId, body.skills);
  }

  /**
   * 查询职位技能要求列表
   */
  @Get()
  @ApiOperation({ summary: '查询职位技能要求列表' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/schemas/JobSkillResponseDto' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: QueryJobSkillsDto) {
    return this.jobSkillService.findAll(query);
  }

  /**
   * 查询单条职位技能要求
   */
  @Get(':id')
  @ApiOperation({ summary: '查询单条职位技能要求' })
  @ApiResponse({ status: 200, type: JobSkillResponseDto })
  findOne(@Param('id') id: string) {
    return this.jobSkillService.findOne(id);
  }

  /**
   * 更新职位技能要求
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新职位技能要求' })
  @ApiResponse({ status: 200, type: JobSkillResponseDto })
  update(@Param('id') id: string, @Body() updateJobSkillDto: UpdateJobSkillDto) {
    return this.jobSkillService.update(id, updateJobSkillDto);
  }

  /**
   * 删除职位技能要求
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除职位技能要求' })
  @ApiResponse({ status: 200, schema: { type: 'object', properties: { message: { type: 'string' } } } })
  remove(@Param('id') id: string) {
    return this.jobSkillService.remove(id);
  }

  /**
   * 获取职位的所有技能要求
   */
  @Get('job/:jobId')
  @ApiOperation({ summary: '获取职位的所有技能要求' })
  @ApiResponse({ status: 200, type: [JobSkillResponseDto] })
  findByJob(@Param('jobId') jobId: string) {
    return this.jobSkillService.findByJob(jobId);
  }

  /**
   * 删除职位的所有技能要求
   */
  @Delete('job/:jobId/all')
  @ApiOperation({ summary: '删除职位的所有技能要求' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        count: { type: 'number' },
      },
    },
  })
  removeByJob(@Param('jobId') jobId: string) {
    return this.jobSkillService.removeByJob(jobId);
  }
}
