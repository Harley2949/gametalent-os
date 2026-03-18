import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RuleEngineService } from './rule-engine.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

/**
 * 自动化服务 - 负责管理自动化规则和触发
 */
@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private prisma: PrismaService,
    private ruleEngine: RuleEngineService,
  ) {}

  /**
   * 创建自动化规则
   */
  async createRule(dto: CreateRuleDto) {
    this.logger.log(`创建自动化规则: ${dto.name}`);

    return this.prisma.processRule.create({
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        ruleType: dto.ruleType,
        triggerCondition: dto.triggerCondition,
        actions: dto.actions || [],
        appliesToJobs: dto.appliesToJobs || [],
      },
    });
  }

  /**
   * 获取所有规则
   */
  async findAllRules() {
    return this.prisma.processRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取单个规则
   */
  async findRuleById(id: string) {
    const rule = await this.prisma.processRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new Error(`规则不存在: ${id}`);
    }

    return rule;
  }

  /**
   * 更新规则
   */
  async updateRule(id: string, dto: UpdateRuleDto) {
    this.logger.log(`更新自动化规则: ${id}`);

    await this.findRuleById(id);

    return this.prisma.processRule.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.triggerCondition !== undefined && { triggerCondition: dto.triggerCondition }),
        ...(dto.actions !== undefined && { actions: dto.actions }),
        ...(dto.appliesToJobs !== undefined && { appliesToJobs: dto.appliesToJobs }),
      },
    });
  }

  /**
   * 删除规则
   */
  async deleteRule(id: string) {
    this.logger.log(`删除自动化规则: ${id}`);

    await this.findRuleById(id);

    return this.prisma.processRule.delete({
      where: { id },
    });
  }

  /**
   * 手动触发规则评估
   */
  async triggerRules(applicationId: string) {
    this.logger.log(`手动触发规则评估: ${applicationId}`);

    return this.ruleEngine.evaluateRules(applicationId);
  }

  /**
   * 运行超时检查
   */
  async runTimeoutCheck() {
    this.logger.log('运行超时检查');

    return this.ruleEngine.checkTimeouts();
  }

  /**
   * 获取规则执行日志
   */
  async getRuleExecutionLogs(applicationId?: string) {
    const where = applicationId ? { applicationId } : {};

    return this.prisma.processLog.findMany({
      where,
      include: {
        application: {
          select: {
            id: true,
            status: true,
            candidate: {
              select: {
                id: true,
                name: true,
              },
            },
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * 获取规则统计
   */
  async getRuleStats() {
    const totalRules = await this.prisma.processRule.count();
    const activeRules = await this.prisma.processRule.count({
      where: { isActive: true },
    });

    const todayLogs = await this.prisma.processLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    return {
      totalRules,
      activeRules,
      todayLogs,
    };
  }

  /**
   * 检查并执行自动化规则（核心方法）
   *
   * @param applicationId - 申请 ID
   * @returns 执行结果
   *
   * 工作流程：
   * 1. 获取申请详情（包含当前状态）
   * 2. 查询所有适用的自动化规则
   * 3. 检查规则触发条件是否满足
   * 4. 如果满足，执行规则动作
   * 5. 记录执行日志
   */
  async checkRules(applicationId: string) {
    this.logger.log(`检查申请的自动化规则: ${applicationId}`);

    try {
      // 1. 获取申请详情
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: true,
          candidate: true,
        },
      });

      if (!application) {
        this.logger.warn(`申请不存在: ${applicationId}`);
        return {
          success: false,
          message: '申请不存在',
          applicationId,
        };
      }

      this.logger.log(
        `申请当前状态: ${application.status}, 候选人: ${application.candidate.name}, 职位: ${application.job.title}`,
      );

      // 2. 查询适用的自动化规则
      const rules = await this.prisma.processRule.findMany({
        where: {
          isActive: true,
          OR: [
            // 适用于所有职位的规则
            { appliesToJobs: { isEmpty: true } },
            // 适用于特定职位的规则
            { appliesToJobs: { has: application.jobId } },
          ],
        },
      });

      this.logger.log(`找到 ${rules.length} 条适用规则`);

      if (rules.length === 0) {
        return {
          success: true,
          message: '没有适用的规则',
          applicationId,
          rulesMatched: 0,
        };
      }

      // 3. 检查每条规则并执行
      const results = [];

      for (const rule of rules) {
        const result = await this.checkAndExecuteRule(rule, application);
        results.push(result);
      }

      // 统计执行结果
      const matchedRules = results.filter((r) => r.matched).length;
      const executedRules = results.filter((r) => r.executed).length;

      return {
        success: true,
        message: `规则检查完成，匹配 ${matchedRules} 条，执行 ${executedRules} 条`,
        applicationId,
        totalRules: rules.length,
        rulesMatched: matchedRules,
        rulesExecuted: executedRules,
        details: results,
      };
    } catch (error: any) {
      this.logger.error(`检查规则时出错: ${error.message}`, error.stack);

      return {
        success: false,
        message: `检查规则时出错: ${error.message}`,
        applicationId,
        error: error.message,
      };
    }
  }

  /**
   * 检查单条规则并执行
   */
  private async checkAndExecuteRule(rule: any, application: any) {
    this.logger.log(`检查规则: ${rule.name}`);

    try {
      // 检查触发条件
      const isMatched = this.evaluateTriggerCondition(
        rule.triggerCondition,
        application,
      );

      if (!isMatched) {
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          matched: false,
          executed: false,
          message: '触发条件不满足',
        };
      }

      this.logger.log(`✓ 规则 "${rule.name}" 触发条件满足`);

      // 执行规则动作
      const executionResults = [];

      for (const action of rule.actions) {
        const result = await this.executeAction(action, application, rule);
        executionResults.push(result);
      }

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        matched: true,
        executed: true,
        message: '规则执行成功',
        actions: executionResults,
      };
    } catch (error: any) {
      this.logger.error(`执行规则失败: ${rule.name}`, error.stack);

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        matched: true,
        executed: false,
        message: `执行失败: ${error.message}`,
        error: error.message,
      };
    }
  }

  /**
   * 评估触发条件
   */
  private evaluateTriggerCondition(condition: any, application: any): boolean {
    if (!condition) {
      return false;
    }

    const { type, field, operator, value } = condition;

    this.logger.log(`评估条件: ${type}, 字段: ${field}, 操作符: ${operator}, 值: ${value}`);

    switch (type) {
      case 'STATUS_EQUALS':
        // 检查申请状态是否等于指定值
        return application.status === value;

      case 'STATUS_IN':
        // 检查申请状态是否在指定列表中
        return Array.isArray(value) && value.includes(application.status);

      case 'FIELD_EQUALS':
        // 检查指定字段是否等于指定值
        return application[field] === value;

      case 'FIELD_GREATER_THAN':
        // 检查指定字段是否大于指定值
        return application[field] > value;

      case 'FIELD_LESS_THAN':
        // 检查指定字段是否小于指定值
        return application[field] < value;

      case 'SCORE_THRESHOLD':
        // 检查匹配分数是否达到阈值
        return (
          application.matchScore !== null &&
          application.matchScore >= value
        );

      case 'TIME_IN_STATUS_GREATER_THAN':
        // 检查在当前状态停留时间是否超过指定值（毫秒）
        const timeInStatus =
          Date.now() - new Date(application.updatedAt).getTime();
        return timeInStatus > value;

      default:
        this.logger.warn(`未知的条件类型: ${type}`);
        return false;
    }
  }

  /**
   * 执行规则动作
   */
  private async executeAction(
    action: any,
    application: any,
    rule: any,
  ): Promise<any> {
    this.logger.log(`执行动作: ${action.type}`);

    const actionResult = {
      type: action.type,
      success: false,
      message: '',
    };

    try {
      switch (action.type) {
        case 'UPDATE_STATUS':
          // 更新申请状态
          await this.updateApplicationStatus(
            application.id,
            application.status,
            action.params.toStatus,
            rule.name,
          );
          actionResult.success = true;
          actionResult.message = `状态已从 ${application.status} 更新为 ${action.params.toStatus}`;
          break;

        case 'SEND_NOTIFICATION':
          // 发送通知（模拟）
          this.simulateNotification(
            application,
            action.params.recipients,
            action.params.message,
          );
          actionResult.success = true;
          actionResult.message = `已发送通知给 ${action.params.recipients.join(', ')}`;
          break;

        case 'SEND_EMAIL':
          // 发送邮件（模拟）
          this.simulateEmail(
            application,
            action.params.to,
            action.params.subject,
            action.params.template,
          );
          actionResult.success = true;
          actionResult.message = `已发送邮件至 ${action.params.to}`;
          break;

        case 'CREATE_TASK':
          // 创建任务（模拟）
          this.simulateTaskCreation(
            application,
            action.params.assignee,
            action.params.title,
            action.params.description,
          );
          actionResult.success = true;
          actionResult.message = `已为 ${action.params.assignee} 创建任务: ${action.params.title}`;
          break;

        case 'LOG_NOTE':
          // 记录内部备注（模拟）
          this.simulateInternalNote(
            application,
            action.params.note,
            action.params.category,
          );
          actionResult.success = true;
          actionResult.message = `已记录内部备注: ${action.params.category}`;
          break;

        default:
          actionResult.success = false;
          actionResult.message = `未知的动作类型: ${action.type}`;
          this.logger.warn(`未知的动作类型: ${action.type}`);
      }
    } catch (error: any) {
      actionResult.success = false;
      actionResult.message = `执行动作失败: ${error.message}`;
      this.logger.error(`执行动作失败: ${action.type}`, error.stack);
    }

    return actionResult;
  }

  /**
   * 更新申请状态
   */
  private async updateApplicationStatus(
    applicationId: string,
    fromStatus: string,
    toStatus: string,
    ruleName: string,
  ) {
    this.logger.log(`更新申请状态: ${fromStatus} -> ${toStatus}`);

    // 更新申请状态
    await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: toStatus as any,
      },
    });

    // 记录流程日志
    await this.prisma.processLog.create({
      data: {
        applicationId,
        fromStatus: fromStatus as any,
        toStatus: toStatus as any,
        changedBy: 'SYSTEM',
        changeType: 'AUTO',
        metadata: {
          triggeredBy: ruleName,
          timestamp: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`✓ 申请状态已更新，流程日志已记录`);
  }

  /**
   * 模拟发送通知（console.log）
   */
  private simulateNotification(
    application: any,
    recipients: string[],
    message: string,
  ) {
    const timestamp = new Date().toISOString();
    console.log('\n========================================');
    console.log('📢 发送通知');
    console.log('========================================');
    console.log(`时间: ${timestamp}`);
    console.log(`收件人: ${recipients.join(', ')}`);
    console.log(`候选人: ${application.candidate.name}`);
    console.log(`职位: ${application.job.title}`);
    console.log(`申请状态: ${application.status}`);
    console.log(`消息内容: ${message}`);
    console.log('========================================\n');

    this.logger.log(`[模拟通知] 发送给 ${recipients.join(', ')}: ${message}`);
  }

  /**
   * 模拟发送邮件（console.log）
   */
  private simulateEmail(
    application: any,
    to: string,
    subject: string,
    template: string,
  ) {
    const timestamp = new Date().toISOString();
    console.log('\n========================================');
    console.log('📧 发送邮件');
    console.log('========================================');
    console.log(`时间: ${timestamp}`);
    console.log(`收件人: ${to}`);
    console.log(`主题: ${subject}`);
    console.log(`模板: ${template}`);
    console.log(`候选人: ${application.candidate.name}`);
    console.log(`职位: ${application.job.title}`);
    console.log('========================================\n');

    this.logger.log(`[模拟邮件] 发送至 ${to}: ${subject}`);
  }

  /**
   * 模拟创建任务（console.log）
   */
  private simulateTaskCreation(
    application: any,
    assignee: string,
    title: string,
    description: string,
  ) {
    const timestamp = new Date().toISOString();
    console.log('\n========================================');
    console.log('✓ 创建任务');
    console.log('========================================');
    console.log(`时间: ${timestamp}`);
    console.log(`负责人: ${assignee}`);
    console.log(`任务标题: ${title}`);
    console.log(`任务描述: ${description}`);
    console.log(`关联申请: ${application.id}`);
    console.log(`候选人: ${application.candidate.name}`);
    console.log('========================================\n');

    this.logger.log(`[模拟任务] 分配给 ${assignee}: ${title}`);
  }

  /**
   * 模拟记录内部备注（console.log）
   */
  private simulateInternalNote(
    application: any,
    note: string,
    category: string,
  ) {
    const timestamp = new Date().toISOString();
    console.log('\n========================================');
    console.log('📝 记录内部备注');
    console.log('========================================');
    console.log(`时间: ${timestamp}`);
    console.log(`分类: ${category}`);
    console.log(`备注内容: ${note}`);
    console.log(`关联申请: ${application.id}`);
    console.log(`候选人: ${application.candidate.name}`);
    console.log('========================================\n');

    this.logger.log(`[模拟备注] ${category}: ${note}`);
  }
}
