import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';

/**
 * 规则引擎服务 - 负责执行自动化规则
 */
@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 评估并执行所有活跃的自动化规则
   */
  async evaluateRules(applicationId: string) {
    this.logger.log(`评估申请的自动化规则: ${applicationId}`);

    // 获取申请详情
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        candidate: true,
      },
    });

    if (!application) {
      this.logger.warn(`申请不存在: ${applicationId}`);
      return;
    }

    // 获取所有适用的规则
    const rules = await this.prisma.processRule.findMany({
      where: {
        isActive: true,
        OR: [
          { appliesToJobs: { isEmpty: true } }, // 适用于所有职位
          { appliesToJobs: { has: application.jobId } }, // 适用于特定职位
        ],
      },
    });

    this.logger.log(`找到 ${rules.length} 条适用规则`);

    // 执行每条规则
    for (const rule of rules) {
      await this.executeRule(rule, application);
    }
  }

  /**
   * 执行单条规则
   */
  private async executeRule(rule: any, application: any) {
    this.logger.log(`执行规则: ${rule.name}`);

    try {
      // 检查触发条件
      const shouldTrigger = this.checkTriggerCondition(rule.triggerCondition, application);

      if (!shouldTrigger) {
        return;
      }

      // 执行规则动作
      for (const action of rule.actions) {
        await this.executeAction(action, application, rule);
      }

      this.logger.log(`规则执行成功: ${rule.name}`);
    } catch (error) {
      this.logger.error(`规则执行失败: ${rule.name}`, error);
    }
  }

  /**
   * 检查触发条件
   */
  private checkTriggerCondition(condition: any, application: any): boolean {
    if (!condition) {
      return false;
    }

    const { type, field, operator, value } = condition;

    switch (type) {
      case 'STATUS_CHANGE':
        return application.status === value;

      case 'FIELD_EQUALS':
        return application[field] === value;

      case 'FIELD_GREATER_THAN':
        return application[field] > value;

      case 'TIME_IN_STATUS':
        // 检查在当前状态停留的时间
        const timeInStatus = Date.now() - new Date(application.updatedAt).getTime();
        return timeInStatus > value;

      case 'SCORE_THRESHOLD':
        return application.matchScore >= value;

      default:
        return false;
    }
  }

  /**
   * 执行规则动作
   */
  private async executeAction(action: any, application: any, rule: any) {
    this.logger.log(`执行动作: ${action.type}`);

    switch (action.type) {
      case 'ADVANCE_STAGE':
        await this.advanceStage(application, action.params);
        break;

      case 'SEND_NOTIFICATION':
        await this.sendNotification(application, action.params);
        break;

      case 'UPDATE_FIELD':
        await this.updateField(application, action.params);
        break;

      case 'CREATE_TASK':
        await this.createTask(application, action.params);
        break;

      case 'SEND_REMINDER':
        await this.sendReminder(application, action.params);
        break;

      case 'AUTO_REJECT':
        await this.autoReject(application, action.params);
        break;

      default:
        this.logger.warn(`未知动作类型: ${action.type}`);
    }
  }

  /**
   * 推进到下一阶段
   */
  private async advanceStage(application: any, params: any) {
    const { toStatus, requireFields } = params;

    // 验证必需字段
    if (requireFields && requireFields.length > 0) {
      // TODO: 实现字段验证逻辑
      this.logger.log(`验证必需字段: ${requireFields.join(', ')}`);
    }

    // 更新状态
    await this.prisma.application.update({
      where: { id: application.id },
      data: {
        status: toStatus,
      },
    });

    // 记录流程日志
    await this.logProcessChange(
      application.id,
      application.status,
      toStatus,
      'SYSTEM',
      'AUTO',
      { rule: '自动推进' },
    );

    this.logger.log(`申请 ${application.id} 已自动推进到 ${toStatus}`);
  }

  /**
   * 发送通知
   */
  private async sendNotification(application: any, params: any) {
    const { recipients, template, data } = params;

    this.logger.log(
      `发送通知给 ${recipients.join(', ')}: ${template}`,
    );

    // TODO: 实现通知发送逻辑
    // 1. 根据模板生成消息内容
    // 2. 发送邮件/站内信/短信
    // 3. 记录发送日志
  }

  /**
   * 更新字段
   */
  private async updateField(application: any, params: any) {
    const { field, value } = params;

    await this.prisma.application.update({
      where: { id: application.id },
      data: {
        [field]: value,
      },
    });

    this.logger.log(`更新字段 ${field} = ${value}`);
  }

  /**
   * 创建任务
   */
  private async createTask(application: any, params: any) {
    const { assignee, title, description, priority } = params;

    this.logger.log(`创建任务: ${title}, 分配给: ${assignee}`);

    // TODO: 实现任务创建逻辑
    // 1. 在任务表中创建新任务
    // 2. 发送通知给任务接收人
  }

  /**
   * 发送提醒
   */
  private async sendReminder(application: any, params: any) {
    const { recipients, message } = params;

    this.logger.log(`发送提醒给 ${recipients.join(', ')}: ${message}`);

    // TODO: 实现提醒发送逻辑
  }

  /**
   * 自动拒绝
   */
  private async autoReject(application: any, params: any) {
    const { reason } = params;

    await this.prisma.application.update({
      where: { id: application.id },
      data: {
        status: ApplicationStatus.REJECTED,
      },
    });

    // 记录流程日志
    await this.logProcessChange(
      application.id,
      application.status,
      ApplicationStatus.REJECTED,
      'SYSTEM',
      'AUTO',
      { reason },
    );

    this.logger.log(`申请 ${application.id} 已自动拒绝: ${reason}`);
  }

  /**
   * 记录流程变更
   */
  private async logProcessChange(
    applicationId: string,
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus,
    changedBy: string,
    changeType: string,
    metadata?: any,
  ) {
    await this.prisma.processLog.create({
      data: {
        applicationId,
        fromStatus,
        toStatus,
        changedBy,
        changeType,
        metadata,
      },
    });
  }

  /**
   * 检查超时的申请
   */
  async checkTimeouts() {
    this.logger.log('检查超时申请');

    // 获取所有活跃的申请
    const activeApplications = await this.prisma.application.findMany({
      where: {
        status: {
          notIn: [ApplicationStatus.HIRED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN],
        },
      },
    });

    const now = Date.now();

    for (const application of activeApplications) {
      const timeInStatus = now - new Date(application.updatedAt).getTime();

      // 检查是否超时（默认 7 天 = 604800000 ms）
      const TIMEOUT_THRESHOLD = 7 * 24 * 60 * 60 * 1000;

      if (timeInStatus > TIMEOUT_THRESHOLD) {
        this.logger.warn(
          `申请 ${application.id} 在状态 ${application.status} 超时 ${Math.floor(timeInStatus / (24 * 60 * 60 * 1000))} 天`,
        );

        // 触发超时相关规则
        await this.evaluateRules(application.id);
      }
    }
  }
}
