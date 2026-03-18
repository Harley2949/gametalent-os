import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResumeParserService } from '../ai/resume-parser.service';
import {
  ParsedResumeResult,
  ParsingStatusResponse,
  UploadResumeDto,
} from './dto';
import { CandidateSource, CandidateStatus, ResumeStatus, EducationLevel, SchoolType, ProjectRole } from '@prisma/client';

@Injectable()
export class ResumeUploadService {
  private readonly logger = new Logger(ResumeUploadService.name);
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly resumeParser: ResumeParserService,
  ) {}

  /**
   * 上传并解析简历
   */
  async uploadAndParse(file: any, options: {
    candidateId?: string;
    title?: string;
    isPrimary?: boolean;
  }): Promise<{
    resumeId: string;
    candidateId: string;
    isNewCandidate: boolean;
    status: ResumeStatus;
  }> {
    // 1. 验证文件
    this.validateFile(file);

    // 2. 提取文件内容
    const fileContent = await this.extractFileContent(file);

    // 3. AI 解析简历
    const parsedData = await this.parseResumeContent(fileContent);

    // 4. 检查或创建候选人
    const { candidateId, isNewCandidate } = await this.findOrCreateCandidate(parsedData);

    // 5. 保存简历记录
    const resume = await this.saveResume({
      candidateId,
      file,
      fileContent,
      parsedData,
      title: options.title,
      isPrimary: options.isPrimary ?? isNewCandidate, // 新候选人的第一份简历默认为主简历
    });

    // 6. 异步更新候选人信息（从解析的数据）
    this.updateCandidateFromParsedData(candidateId, parsedData);

    // 7. 异步创建关联记录（教育、工作经历等）
    this.createRelatedRecords(candidateId, resume.id, parsedData);

    return {
      resumeId: resume.id,
      candidateId,
      isNewCandidate,
      status: resume.status as ResumeStatus,
    };
  }

  /**
   * 验证文件
   */
  private validateFile(file: any): void {
    if (!file) {
      throw new BadRequestException('文件不能为空');
    }

    // 检查文件大小
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(`文件大小不能超过 ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // 检查文件类型
    if (!this.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`不支持的文件类型：${file.mimetype}。仅支持 PDF 和图片（JPEG, PNG）`);
    }
  }

  /**
   * 提取文件内容
   * 添加详细的调试日志
   */
  private async extractFileContent(file: any): Promise<string> {
    this.logger.log('📄 开始提取文件内容...', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
      hasPath: !!file.path,
      bufferLength: file.buffer?.length || 0,
    });

    try {
      const buffer = file.buffer;

      if (!buffer) {
        throw new Error('文件 buffer 为空');
      }

      // PDF 文件
      if (file.mimetype === 'application/pdf') {
        this.logger.log('📕 检测到 PDF 文件，开始解析...');
        // pdf-parse 2.x 的正确导入方式
        const pdfParse = await import('pdf-parse');
        const data = await (pdfParse as any).default(buffer);
        const textLength = data.text.length;
        this.logger.log(`✅ PDF 解析成功，提取文本长度: ${textLength} 字符`);
        return data.text;
      }

      // 图片文件 - 返回占位符（需要 OCR 服务）
      if (file.mimetype.startsWith('image/')) {
        this.logger.warn('⚠️ 图片文件需要 OCR 服务，当前返回占位符');
        return '[图片文件 - 需要 OCR 解析]';
      }

      throw new BadRequestException('不支持的文件类型');
    } catch (error) {
      this.logger.error('❌ 提取文件内容时出错:', {
        error: error instanceof Error ? error.message : String(error),
        filename: file.originalname,
        mimetype: file.mimetype,
      });
      throw new BadRequestException('文件解析失败，请确保文件格式正确');
    }
  }

  /**
   * AI 解析简历内容
   * 包含文本长度检查、错误处理和降级方案
   */
  private async parseResumeContent(content: string): Promise<ParsedResumeResult> {
    const startTime = Date.now();
    this.logger.log(`📋 开始解析简历，原始文本长度: ${content.length} 字符`);

    try {
      // 使用 AI 解析简历（已包含文本截断逻辑）
      const parsed = await this.resumeParser.parseResume({ content }, 'upload');

      const duration = Date.now() - startTime;
      this.logger.log(`✅ AI 解析成功 (耗时: ${duration}ms)`, {
        name: parsed.name || '未识别',
        email: parsed.email || '未识别',
        phoneNumber: parsed.phoneNumber || '未识别',
        hasWarnings: parsed.warnings?.length > 0,
      });

      // 如果有警告，记录日志
      if (parsed.warnings && parsed.warnings.length > 0) {
        this.logger.warn(`⚠️ 解析产生 ${parsed.warnings.length} 个警告:`, parsed.warnings);
      }

      // 转换为标准格式
      return this.normalizeParsedData(parsed);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`❌ AI 解析失败 (耗时: ${duration}ms):`, {
        error: errorMessage,
        textLength: content.length,
        estimatedTokens: Math.round(content.length / 3),
      });

      // 降级方案：返回最小可用数据，确保上传流程继续
      // 这样上传仍然可以成功，只是没有 AI 提取的信息
      this.logger.warn('🔄 使用降级方案：返回空数据，允许手动填写候选人信息');

      return {
        name: '',
        email: '',
        phoneNumber: '',
        linkedinUrl: '',
        githubUrl: '',
        currentTitle: '',
        currentCompany: '',
        yearsOfExperience: 0,
        isCurrentlyEmployed: undefined,
        skills: {
          engines: [],
          languages: [],
          tools: [],
          gameGenres: [],
          artStyles: [],
        },
        projects: [],
        workExperience: [],
        education: [],
        warnings: [
          `AI 解析失败: ${errorMessage}`,
          `简历文本长度: ${content.length} 字符 (约 ${Math.round(content.length / 3)} tokens)`,
          '建议: 请手动填写候选人信息，或稍后点击"重新解析"按钮',
        ],
      };
    }
  }

  /**
   * 标准化解析数据
   * 处理 AI 返回的不同字段名格式，确保数据一致性
   */
  private normalizeParsedData(data: any): ParsedResumeResult {
    this.logger.debug('🔄 标准化解析数据', {
      rawName: data.name,
      rawEmail: data.email,
      rawPhone: data.phoneNumber,
      hasSkills: !!data.skills,
      hasProjects: !!data.projects?.length,
    });

    // 提取 GitHub 和 LinkedIn（处理多种可能的字段名）
    const githubUrl = data.github || data.portfolio?.github || data.githubUrl || '';
    const linkedinUrl = data.linkedin || data.linkedinUrl || data.portfolio?.linkedin || '';

    // 处理技能数据（确保 engines 和 languages 是数组）
    const rawEngines = data.skills?.engines || [];
    const rawLanguages = data.skills?.languages || [];

    // 确保 engines 格式正确
    const engines = rawEngines.map((engine: any) => ({
      name: typeof engine === 'string' ? engine : engine.name,
      level: engine.level || 'intermediate',
    }));

    // 确保 languages 格式正确
    const languages = rawLanguages.map((lang: any) => ({
      name: typeof lang === 'string' ? lang : lang.name,
      level: lang.level || 'intermediate',
    }));

    const normalized = {
      name: (data.name || '').trim(),
      email: (data.email || '').trim(),
      phoneNumber: data.phoneNumber || '',
      linkedinUrl,
      githubUrl,
      currentTitle: data.currentTitle || '',
      currentCompany: data.currentCompany || '',
      yearsOfExperience: data.workYears || data.yearsOfExperience || 0,
      isCurrentlyEmployed: undefined,
      skills: {
        engines,
        languages,
        tools: data.skills?.tools || [],
        gameGenres: data.skills?.gameGenres || [],
        artStyles: data.skills?.artStyles || [],
      },
      projects: (data.projects || []).map((p: any) => ({
        name: p.name || '未命名项目',
        role: p.role || '',
        status: p.status || 'in-development',
        platform: p.platform || p.platforms,
        description: p.description || '',
        achievements: p.achievements || [],
      })),
      workExperience: data.workExperience || [],
      education: (data.education || []).map((edu: any) => ({
        school: edu.school || '',
        degree: edu.degree || '',
        major: edu.major || '',
        level: this.mapDegreeToLevel(edu.degree),
        isOverseas: edu.isOverseas || false,
      })),
      warnings: data.warnings || [],
    };

    this.logger.debug('✅ 标准化完成', {
      name: normalized.name || '空',
      email: normalized.email || '空',
      enginesCount: normalized.skills.engines.length,
      languagesCount: normalized.skills.languages.length,
      projectsCount: normalized.projects.length,
    });

    return normalized;
  }

  /**
   * 查找或创建候选人
   */
  private async findOrCreateCandidate(parsedData: ParsedResumeResult): Promise<{
    candidateId: string;
    isNewCandidate: boolean;
  }> {
    // 1. 尝试通过邮箱查找现有候选人
    if (parsedData.email) {
      const existingCandidate = await this.prisma.candidate.findUnique({
        where: { email: parsedData.email },
      });

      if (existingCandidate) {
        this.logger.log(`✅ 找到现有候选人: ${existingCandidate.id} (${existingCandidate.name})`);
        return { candidateId: existingCandidate.id, isNewCandidate: false };
      }
    }

    // 2. 如果没有邮箱，尝试通过手机号查找
    if (parsedData.phoneNumber && !parsedData.email) {
      const existingByPhone = await this.prisma.candidate.findFirst({
        where: { phoneNumber: parsedData.phoneNumber },
      });

      if (existingByPhone) {
        this.logger.log(`✅ 通过手机号找到现有候选人: ${existingByPhone.id} (${existingByPhone.name})`);
        return { candidateId: existingByPhone.id, isNewCandidate: false };
      }
    }

    // 3. 生成候选人显示名称（如果姓名为空）
    let displayName = parsedData.name || '待完善';
    if (!parsedData.name) {
      // 如果没有姓名，使用邮箱前缀或手机号后4位
      if (parsedData.email) {
        displayName = parsedData.email.split('@')[0];
      } else if (parsedData.phoneNumber) {
        displayName = `候选人${parsedData.phoneNumber.slice(-4)}`;
      }
      this.logger.warn(`⚠️ 候选人姓名为空，使用生成名称: ${displayName}`);
    }

    // 4. 创建新候选人
    try {
      const newCandidate = await this.prisma.candidate.create({
        data: {
          email: parsedData.email || null, // 允许为空
          name: displayName,
          phoneNumber: parsedData.phoneNumber || null,
          linkedinUrl: parsedData.linkedinUrl || null,
          githubUrl: parsedData.githubUrl || null,
          currentTitle: parsedData.currentTitle || null,
          currentCompany: parsedData.currentCompany || null,
          yearsOfExperience: parsedData.yearsOfExperience || 0,
          isCurrentlyEmployed: parsedData.isCurrentlyEmployed ?? true,
          source: CandidateSource.UPLOAD,
          status: CandidateStatus.ACTIVE,
          // 教育信息（取最高学历）
          educationLevel: parsedData.education[0]?.level as EducationLevel || null,
          school: parsedData.education[0]?.school || null,
          major: parsedData.education[0]?.major || null,
        },
      });

      this.logger.log(`✅ 创建新候选人: ${newCandidate.id}`, {
        name: newCandidate.name,
        email: newCandidate.email || '无',
        phone: newCandidate.phoneNumber || '无',
      });

      return { candidateId: newCandidate.id, isNewCandidate: true };
    } catch (error) {
      this.logger.error('❌ 创建候选人失败:', error);
      throw new Error(`创建候选人失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 保存简历记录
   * 包括文件保存和数据库记录
   */
  private async saveResume(data: {
    candidateId: string;
    file: any;
    fileContent: string;
    parsedData: ParsedResumeResult;
    title?: string;
    isPrimary: boolean;
  }) {
    this.logger.log('📁 开始保存简历文件...', {
      originalname: data.file.originalname,
      mimetype: data.file.mimetype,
      size: data.file.size,
      hasBuffer: !!data.file.buffer,
      hasPath: !!data.file.path,
    });

    // 如果设置为主简历，取消其他简历的主状态
    if (data.isPrimary) {
      await this.prisma.resume.updateMany({
        where: { candidateId: data.candidateId },
        data: { isPrimary: false },
      });
    }

    // 提取技能列表
    const skills = this.extractSkillsList(data.parsedData);

    // 确定文件路径
    let filePath = data.file.path; // Multer 保存的路径
    let fileUrl = `/uploads/resumes/${data.file.filename || data.file.originalname}`;

    // 如果文件在内存中（buffer），手动保存到磁盘
    if (!filePath && data.file.buffer) {
      const fs = await import('fs');
      const path = await import('path');

      const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
      const uniqueFileName = `${Date.now()}-${data.file.originalname}`;
      filePath = path.join(uploadsDir, uniqueFileName);
      fileUrl = `/uploads/resumes/${uniqueFileName}`;

      this.logger.log(`💾 手动保存文件到磁盘: ${filePath}`);

      try {
        fs.writeFileSync(filePath, data.file.buffer);
        this.logger.log(`✅ 文件保存成功: ${filePath}`);
      } catch (error) {
        this.logger.error('❌ 文件保存失败:', error);
        // 即使文件保存失败，仍然继续创建数据库记录
        filePath = '';
        fileUrl = '';
      }
    }

    // 检查文件是否存在
    if (filePath) {
      const fs = await import('fs');
      const fileExists = fs.existsSync(filePath);
      this.logger.log(`🔍 文件存在检查: ${filePath} - ${fileExists ? '存在' : '不存在'}`);

      if (!fileExists) {
        this.logger.warn(`⚠️ 警告：文件路径不存在 ${filePath}`);
      }
    }

    const resume = await this.prisma.resume.create({
      data: {
        candidateId: data.candidateId,
        title: data.title || data.file.originalname,
        fileName: data.file.originalname,
        fileUrl: fileUrl,
        fileSize: data.file.size,
        fileType: data.file.mimetype,
        rawData: data.fileContent,
        rawText: data.fileContent,
        parsedData: data.parsedData as any,
        skills,
        status: ResumeStatus.READY,
        parsedAt: new Date(),
        parserVersion: '1.0.0',
        isPrimary: data.isPrimary,
      },
    });

    this.logger.log(`✅ 创建简历记录成功`, {
      resumeId: resume.id,
      fileUrl: resume.fileUrl,
      filePath: filePath,
      fileName: resume.fileName,
    });

    return resume;
  }

  /**
   * 提取技能列表
   */
  private extractSkillsList(parsedData: ParsedResumeResult): string[] {
    const skills: string[] = [];

    // 引擎技能
    parsedData.skills.engines.forEach(engine => skills.push(engine.name));

    // 编程语言
    parsedData.skills.languages.forEach(lang => skills.push(lang.name));

    // 工具
    skills.push(...parsedData.skills.tools);

    return [...new Set(skills)];
  }

  /**
   * 从解析数据更新候选人信息
   */
  private async updateCandidateFromParsedData(candidateId: string, parsedData: ParsedResumeResult) {
    try {
      await this.prisma.candidate.update({
        where: { id: candidateId },
        data: {
          currentTitle: parsedData.currentTitle,
          currentCompany: parsedData.currentCompany,
          yearsOfExperience: parsedData.yearsOfExperience,
          linkedinUrl: parsedData.linkedinUrl,
          githubUrl: parsedData.githubUrl,
        },
      });
    } catch (error) {
      this.logger.error('更新候选人信息时出错:', error);
    }
  }

  /**
   * 创建关联记录（教育、工作经历等）
   */
  private async createRelatedRecords(candidateId: string, resumeId: string, parsedData: ParsedResumeResult) {
    try {
      // 创建教育记录
      for (const edu of parsedData.education) {
        await this.prisma.education.create({
          data: {
            candidateId,
            school: edu.school,
            degree: edu.degree,
            major: edu.major,
            level: edu.level as EducationLevel,
            schoolType: SchoolType.OTHER, // 默认值，可以后续通过AI解析优化
            isOverseas: edu.isOverseas ?? false,
          },
        });
      }

      // 创建工作经历记录
      for (const work of parsedData.workExperience) {
        await this.prisma.workExperience.create({
          data: {
            candidateId,
            companyName: work.company,
            title: work.title,
            startDate: new Date(work.startDate),
            endDate: work.endDate ? new Date(work.endDate) : null,
            isCurrent: work.isCurrent,
            description: work.description,
          },
        });
      }

      // 创建项目经验记录
      for (const project of parsedData.projects) {
        await this.prisma.projectExperience.create({
          data: {
            resumeId,
            projectName: project.name,
            projectType: 'GAME',
            description: project.description,
            role: this.mapProjectRole(project.role),
            achievements: project.achievements?.join('\n') || project.description,
          },
        });
      }
    } catch (error) {
      this.logger.error('创建关联记录时出错:', error);
    }
  }

  /**
   * 获取解析状态
   */
  async getParsingStatus(resumeId: string): Promise<ParsingStatusResponse> {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    return {
      resumeId: resume.id,
      status: resume.status as ResumeStatus,
      progress: resume.status === ResumeStatus.READY ? 100 : 0,
      parsedData: (resume.parsedData as unknown) as ParsedResumeResult,
      error: resume.errorMessage || undefined,
      startedAt: resume.createdAt,
      completedAt: resume.parsedAt || undefined,
    };
  }

  /**
   * 重新解析简历
   */
  async reparseResume(resumeId: string): Promise<ParsedResumeResult> {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: { candidate: true },
    });

    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    if (!resume.rawData && !resume.rawText) {
      throw new BadRequestException('简历没有原始文本，无法重新解析');
    }

    // 更新状态为解析中
    await this.prisma.resume.update({
      where: { id: resumeId },
      data: { status: ResumeStatus.PARSING },
    });

    // 重新解析
    const parsedData = await this.parseResumeContent(resume.rawText);

    // 更新简历
    const skills = this.extractSkillsList(parsedData);
    await this.prisma.resume.update({
      where: { id: resumeId },
      data: {
        parsedData: parsedData as any,
        skills,
        status: ResumeStatus.READY,
        parsedAt: new Date(),
      },
    });

    return parsedData;
  }

  // 辅助方法

  private mapDegreeToLevel(degree?: string): EducationLevel {
    const degreeMap: Record<string, EducationLevel> = {
      '博士': EducationLevel.PHD,
      '硕士': EducationLevel.MASTER,
      '本科': EducationLevel.BACHELOR,
      '大专': EducationLevel.VOCATIONAL,
      '高职': EducationLevel.VOCATIONAL,
      '高中': EducationLevel.HIGH_SCHOOL,
    };

    for (const [key, value] of Object.entries(degreeMap)) {
      if (degree?.includes(key)) {
        return value;
      }
    }

    return EducationLevel.OTHER;
  }

  private mapProjectRole(role: string): ProjectRole {
    const roleMap: Record<string, ProjectRole> = {
      '程序员': ProjectRole.PROGRAMMER,
      '开发工程师': ProjectRole.PROGRAMMER,
      '主程': ProjectRole.TECH_LEAD,
      '技术负责人': ProjectRole.TECH_LEAD,
      '美术': ProjectRole.ARTIST,
      '设计师': ProjectRole.DESIGNER,
      '制作人': ProjectRole.PRODUCER,
    };

    for (const [key, value] of Object.entries(roleMap)) {
      if (role.includes(key)) {
        return value;
      }
    }

    return ProjectRole.OTHER;
  }
}
