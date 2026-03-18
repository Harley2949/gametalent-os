import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyService } from './company.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  QueryCompaniesDto,
  CompanyResponseDto,
} from './dto';

@ApiTags('Company - 公司信息库管理')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * 创建公司
   */
  @Post()
  @ApiOperation({ summary: '创建公司' })
  @ApiResponse({ status: 201, type: CompanyResponseDto })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  /**
   * 批量导入公司数据
   */
  @Post('import')
  @ApiOperation({ summary: '批量导入公司数据' })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'array' },
        failed: { type: 'array' },
      },
    },
  })
  importCompanies(@Body() companies: CreateCompanyDto[]) {
    return this.companyService.importCompanies(companies);
  }

  /**
   * 查询公司列表
   */
  @Get()
  @ApiOperation({ summary: '查询公司列表' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/schemas/CompanyResponseDto' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: QueryCompaniesDto) {
    return this.companyService.findAll(query);
  }

  /**
   * 查询单条公司
   */
  @Get(':id')
  @ApiOperation({ summary: '查询单条公司' })
  @ApiResponse({ status: 200, type: CompanyResponseDto })
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  /**
   * 更新公司信息
   */
  @Put(':id')
  @ApiOperation({ summary: '更新公司信息' })
  @ApiResponse({ status: 200, type: CompanyResponseDto })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  /**
   * 删除公司
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除公司' })
  @ApiResponse({ status: 200, schema: { type: 'object', properties: { message: { type: 'string' } } } })
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }

  /**
   * 根据别名查找公司（用于自动匹配）
   */
  @Get('search/:alias')
  @ApiOperation({ summary: '根据别名查找公司' })
  @ApiResponse({ status: 200, type: [CompanyResponseDto] })
  findByAlias(@Param('alias') alias: string) {
    return this.companyService.findByAlias(alias);
  }

  /**
   * 获取所有竞争对手公司
   */
  @Get('competitors')
  @ApiOperation({ summary: '获取所有竞争对手公司' })
  @ApiResponse({ status: 200, type: [CompanyResponseDto] })
  findCompetitors() {
    return this.companyService.findCompetitors();
  }

  /**
   * 按类型获取公司
   */
  @Get('type/:type')
  @ApiOperation({ summary: '按类型获取公司' })
  @ApiResponse({ status: 200, type: [CompanyResponseDto] })
  findByType(@Param('type') type: string) {
    return this.companyService.findByType(type);
  }

  /**
   * 搜索公司（模糊匹配）
   */
  @Get('search')
  @ApiOperation({ summary: '搜索公司' })
  @ApiResponse({ status: 200, type: [CompanyResponseDto] })
  search(@Query('keyword') keyword: string) {
    return this.companyService.search(keyword);
  }
}
