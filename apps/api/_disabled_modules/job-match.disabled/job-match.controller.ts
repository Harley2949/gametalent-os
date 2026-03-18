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
import { JobMatchService } from './job-match.service';
import {
  CreateJobMatchDto,
  UpdateJobMatchDto,
  QueryJobMatchesDto,
  TriggerJobMatchingDto,
  JobMatchResponseDto,
} from './dto';

@ApiTags('JobMatch - AI 匹配管理')
@Controller('job-matches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobMatchController {
  constructor(private readonly jobMatchService: JobMatchService) {}

  /**
   * 创建匹配记录
   */
  @Post()
  @ApiOperation({ summary: '创建匹配记录' })
  @ApiResponse({ status: 201, type: JobMatchResponseDto })
  create(@Body() createJobMatchDto: CreateJobMatchDto) {
    return this.jobMatchService.create(createJobMatchDto);
  }

  /**
   * 查询匹配记录列表
   */
  @Get()
  @ApiOperation({ summary: '查询匹配记录列表' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/schemas/JobMatchResponseDto' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: QueryJobMatchesDto) {
    return this.jobMatchService.findAll(query);
  }

  /**
   * 查询单条匹配记录
   */
  @Get(':id')
  @ApiOperation({ summary: '查询单条匹配记录' })
  @ApiResponse({ status: 200, type: JobMatchResponseDto })
  findOne(@Param('id') id: string) {
    return this.jobMatchService.findOne(id);
  }

  /**
   * 更新匹配记录
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新匹配记录' })
  @ApiResponse({ status: 200, type: JobMatchResponseDto })
  update(@Param('id') id: string, @Body() updateJobMatchDto: UpdateJobMatchDto) {
    return this.jobMatchService.update(id, updateJobMatchDto);
  }

  /**
   * 删除匹配记录
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除匹配记录' })
  @ApiResponse({ status: 200, schema: { type: 'object', properties: { message: { type: 'string' } } } })
  remove(@Param('id') id: string) {
    return this.jobMatchService.remove(id);
  }

  /**
   * 触发 AI 匹配计算 ⭐ 核心功能
   */
  @Post('trigger')
  @ApiOperation({ summary: '触发 AI 匹配计算' })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: {
        jobId: { type: 'string' },
        total: { type: 'number' },
        matches: { type: 'array' },
      },
    },
  })
  triggerMatching(@Body() dto: TriggerJobMatchingDto) {
    return this.jobMatchService.triggerMatching(dto);
  }

  /**
   * 获取职位的最佳匹配候选人
   */
  @Get('job/:jobId/top-candidates')
  @ApiOperation({ summary: '获取职位的最佳匹配候选人' })
  @ApiResponse({ status: 200, type: [JobMatchResponseDto] })
  getTopCandidates(
    @Param('jobId') jobId: string,
    @Query('limit') limit?: string,
  ) {
    return this.jobMatchService.findAll({
      jobId,
      minScore: 60,
      limit: limit ? Number(limit) : 10,
    });
  }

  /**
   * 获取候选人的所有职位匹配
   */
  @Get('candidate/:candidateId/matches')
  @ApiOperation({ summary: '获取候选人的所有职位匹配' })
  @ApiResponse({ status: 200, type: [JobMatchResponseDto] })
  getCandidateMatches(@Param('candidateId') candidateId: string) {
    return this.jobMatchService.findAll({
      candidateId,
      minScore: 0,
    });
  }
}
