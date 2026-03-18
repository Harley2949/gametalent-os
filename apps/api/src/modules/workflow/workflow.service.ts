import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessTemplateDto } from './dto/create-process-template.dto';
import { UpdateProcessTemplateDto } from './dto/update-process-template.dto';
import { CreateProcessNodeDto } from './dto/create-process-node.dto';
import { UpdateProcessNodeDto } from './dto/update-process-node.dto';

// 工作流服务 - 负责管理招聘流程模板和节点
@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建流程模板
   */
  async createTemplate(dto: CreateProcessTemplateDto) {
    this.logger.log(`创建流程模板: ${dto.name}`);

    const template = await this.prisma.processTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        isDefault: dto.isDefault ?? false,
        jobTypes: dto.jobTypes || [],
      },
      include: {
        nodes: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return template;
  }

  /**
   * 获取所有流程模板
   */
  async findAllTemplates() {
    return this.prisma.processTemplate.findMany({
      where: { isActive: true },
      include: {
        nodes: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取单个流程模板
   */
  async findTemplateById(id: string) {
    const template = await this.prisma.processTemplate.findUnique({
      where: { id },
      include: {
        nodes: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`流程模板不存在: ${id}`);
    }

    return template;
  }

  /**
   * 更新流程模板
   */
  async updateTemplate(id: string, dto: UpdateProcessTemplateDto) {
    this.logger.log(`更新流程模板: ${id}`);

    await this.findTemplateById(id);

    return this.prisma.processTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.jobTypes !== undefined && { jobTypes: dto.jobTypes }),
      },
      include: {
        nodes: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * 删除流程模板
   */
  async deleteTemplate(id: string) {
    this.logger.log(`删除流程模板: ${id}`);

    await this.findTemplateById(id);

    return this.prisma.processTemplate.delete({
      where: { id },
    });
  }

  /**
   * 创建流程节点
   */
  async createNode(templateId: string, dto: CreateProcessNodeDto) {
    this.logger.log(`创建流程节点: ${dto.name}`);

    // 验证模板存在
    await this.findTemplateById(templateId);

    return this.prisma.processNode.create({
      data: {
        templateId,
        name: dto.name,
        label: dto.label,
        description: dto.description,
        stage: dto.stage,
        order: dto.order,
        isRequired: dto.isRequired ?? true,
        requiredFields: dto.requiredFields || [],
        autoAdvance: dto.autoAdvance ?? false,
        autoAdvanceRule: dto.autoAdvanceRule,
        notifyCandidate: dto.notifyCandidate ?? false,
        notifyInterviewers: dto.notifyInterviewers ?? false,
        notificationTemplates: dto.notificationTemplates,
      },
    });
  }

  /**
   * 获取模板的所有节点
   */
  async findNodesByTemplate(templateId: string) {
    await this.findTemplateById(templateId);

    return this.prisma.processNode.findMany({
      where: { templateId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * 更新流程节点
   */
  async updateNode(id: string, dto: UpdateProcessNodeDto) {
    this.logger.log(`更新流程节点: ${id}`);

    return this.prisma.processNode.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.isRequired !== undefined && { isRequired: dto.isRequired }),
        ...(dto.requiredFields !== undefined && { requiredFields: dto.requiredFields }),
        ...(dto.autoAdvance !== undefined && { autoAdvance: dto.autoAdvance }),
        ...(dto.autoAdvanceRule !== undefined && { autoAdvanceRule: dto.autoAdvanceRule }),
        ...(dto.notifyCandidate !== undefined && { notifyCandidate: dto.notifyCandidate }),
        ...(dto.notifyInterviewers !== undefined && { notifyInterviewers: dto.notifyInterviewers }),
        ...(dto.notificationTemplates !== undefined && { notificationTemplates: dto.notificationTemplates }),
      },
    });
  }

  /**
   * 删除流程节点
   */
  async deleteNode(id: string) {
    this.logger.log(`删除流程节点: ${id}`);

    return this.prisma.processNode.delete({
      where: { id },
    });
  }

  /**
   * 根据职位类型获取推荐的流程模板
   */
  async getRecommendedTemplate(jobType: string) {
    // 先查找默认模板
    const defaultTemplate = await this.prisma.processTemplate.findFirst({
      where: {
        isActive: true,
        isDefault: true,
        jobTypes: {
          has: jobType,
        },
      },
      include: {
        nodes: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (defaultTemplate) {
      return defaultTemplate;
    }

    // 如果没有默认模板，返回第一个活跃模板
    return this.prisma.processTemplate.findFirst({
      where: {
        isActive: true,
        jobTypes: {
          has: jobType,
        },
      },
      include: {
        nodes: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * 获取流程统计
   */
  async getTemplateStats(templateId: string) {
    const template = await this.prisma.processTemplate.findUnique({
      where: { id: templateId },
      include: {
        nodes: true,
      },
    });

    if (!template) {
      throw new NotFoundException(`流程模板不存在: ${templateId}`);
    }

    // 统计使用此模板的职位数量
    // TODO: 当 Job 表添加 templateId 字段后实现

    return {
      templateId: template.id,
      templateName: template.name,
      nodeCount: template.nodes.length,
      isActive: template.isActive,
    };
  }
}
