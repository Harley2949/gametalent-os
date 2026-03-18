import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@ApiTags('automation')
@Controller('automation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('rules')
  @ApiOperation({ summary: '创建自动化规则' })
  createRule(@Body() dto: CreateRuleDto) {
    return this.automationService.createRule(dto);
  }

  @Get('rules')
  @ApiOperation({ summary: '获取所有自动化规则' })
  findAllRules() {
    return this.automationService.findAllRules();
  }

  @Get('rules/:id')
  @ApiOperation({ summary: '获取规则详情' })
  findRuleById(@Param('id') id: string) {
    return this.automationService.findRuleById(id);
  }

  @Put('rules/:id')
  @ApiOperation({ summary: '更新自动化规则' })
  updateRule(@Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.automationService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: '删除自动化规则' })
  deleteRule(@Param('id') id: string) {
    return this.automationService.deleteRule(id);
  }

  @Post('trigger/:applicationId')
  @ApiOperation({ summary: '手动触发规则评估' })
  triggerRules(@Param('applicationId') applicationId: string) {
    return this.automationService.triggerRules(applicationId);
  }

  @Post('check/:applicationId')
  @ApiOperation({ summary: '检查并执行自动化规则（核心方法）' })
  checkRules(@Param('applicationId') applicationId: string) {
    return this.automationService.checkRules(applicationId);
  }

  @Post('check-timeouts')
  @ApiOperation({ summary: '运行超时检查' })
  runTimeoutCheck() {
    return this.automationService.runTimeoutCheck();
  }

  @Get('logs')
  @ApiOperation({ summary: '获取规则执行日志' })
  getRuleExecutionLogs(@Param('applicationId') applicationId?: string) {
    return this.automationService.getRuleExecutionLogs(applicationId);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取规则统计' })
  getRuleStats() {
    return this.automationService.getRuleStats();
  }
}
