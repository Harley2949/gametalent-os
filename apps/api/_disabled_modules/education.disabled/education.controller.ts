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
import { EducationService } from './education.service';
import {
  CreateEducationDto,
  UpdateEducationDto,
  QueryEducationsDto,
  EducationResponseDto,
} from './dto';

@ApiTags('Education - 教育经历管理')
@Controller('educations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  /**
   * 创建教育经历
   */
  @Post()
  @ApiOperation({ summary: '创建教育经历' })
  @ApiResponse({ status: 201, type: EducationResponseDto })
  create(@Body() createEducationDto: CreateEducationDto) {
    return this.educationService.create(
      createEducationDto.candidateId,
      createEducationDto,
    );
  }

  /**
   * 批量创建教育经历
   */
  @Post('batch')
  @ApiOperation({ summary: '批量创建教育经历' })
  @ApiResponse({ status: 201, type: [EducationResponseDto] })
  createBatch(@Body() dtos: CreateEducationDto[]) {
    if (dtos.length === 0) {
      return [];
    }
    return this.educationService.createBatch(dtos[0].candidateId, dtos);
  }

  /**
   * 查询教育经历列表
   */
  @Get()
  @ApiOperation({ summary: '查询教育经历列表' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/schemas/EducationResponseDto' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: QueryEducationsDto) {
    return this.educationService.findAll(query);
  }

  /**
   * 查询单条教育经历
   */
  @Get(':id')
  @ApiOperation({ summary: '查询单条教育经历' })
  @ApiResponse({ status: 200, type: EducationResponseDto })
  findOne(@Param('id') id: string) {
    return this.educationService.findOne(id);
  }

  /**
   * 更新教育经历
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新教育经历' })
  @ApiResponse({ status: 200, type: EducationResponseDto })
  update(@Param('id') id: string, @Body() updateEducationDto: UpdateEducationDto) {
    return this.educationService.update(id, updateEducationDto);
  }

  /**
   * 删除教育经历
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除教育经历' })
  @ApiResponse({ status: 200, schema: { type: 'object', properties: { message: { type: 'string' } } } })
  remove(@Param('id') id: string) {
    return this.educationService.remove(id);
  }

  /**
   * 获取候选人的所有教育经历
   */
  @Get('candidate/:candidateId')
  @ApiOperation({ summary: '获取候选人的所有教育经历' })
  @ApiResponse({ status: 200, type: [EducationResponseDto] })
  findByCandidate(@Param('candidateId') candidateId: string) {
    return this.educationService.findByCandidate(candidateId);
  }

  /**
   * 按学校筛选候选人（用于招聘筛选）
   */
  @Get('filter/candidates')
  @ApiOperation({ summary: '按学校筛选候选人' })
  @ApiResponse({ status: 200, type: [Object] })
  findCandidatesBySchool(
    @Query('schoolType') schoolType?: string,
    @Query('qsRankingMax') qsRankingMax?: number,
  ) {
    return this.educationService.findCandidatesBySchool(
      schoolType as any,
      qsRankingMax ? Number(qsRankingMax) : undefined,
    );
  }
}
