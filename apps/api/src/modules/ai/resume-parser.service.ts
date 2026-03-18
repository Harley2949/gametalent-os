import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';

interface ParsedResume {
  // 基本信息
  name: string;
  phoneNumber: string;
  email: string;
  linkedin?: string;

  // 职业信息
  currentTitle: string;
  currentCompany: string;
  workYears: number;

  // 技能标签（游戏垂直）
  skills: {
    engines: Array<{ name: string; level: 'expert' | 'familiar' | 'basic' }>;
    languages: string[];
    taDirection?: string[];
    gameGenres: string[];
    artStyles?: string[];
  };

  // 项目经验
  projects: Array<{
    name: string;
    role: string;
    status: 'released' | 'in-development' | 'testing';
    scale?: string;
    description: string;
  }>;

  // 教育背景
  education: Array<{
    school: string;
    degree: string;
    major: string;
  }>;

  // 作品集
  portfolio: {
    github?: string;
    artstation?: string;
    behance?: string;
    website?: string;
  };

  // 逻辑疑点
  warnings: string[];
}

@Injectable()
export class ResumeParserService {
  private readonly logger = new Logger(ResumeParserService.name);

  // 安全长度配置
  private readonly MAX_SAFE_CHARS = 4000; // 最大安全字符数
  private readonly TRUNCATE_SUFFIX = '\n\n[内容因过长已被截断，如需完整解析请联系管理员]';

  constructor(
    private readonly ai: AiService,
    private readonly prisma: PrismaService,
  ) {}

  async parseResume(file: any, source?: string): Promise<ParsedResume> {
    // 如果传入的是包含 content 字段的对象（直接提取后的文本）
    if (file.content && typeof file.content === 'string') {
      return this.analyzeWithAI(file.content, source);
    }
    // 否则使用原始的文件提取逻辑
    const text = await this.extractText(file);
    return this.analyzeWithAI(text, source);
  }

  async parseFromURL(url: string, source: string): Promise<ParsedResume> {
    const text = await this.fetchContent(url);
    return this.analyzeWithAI(text, source);
  }

  private async extractText(file: any): Promise<string> {
    // 如果文件已经包含提取的文本内容，直接返回
    if (file.content && typeof file.content === 'string') {
      return file.content;
    }

    // 如果文件有 buffer 且是 PDF，需要使用 pdf-parse 提取文本
    // 注意：这个逻辑应该在调用方处理，这里只是兜底
    if (file.buffer && file.mimetype === 'application/pdf') {
      try {
        // pdf-parse 2.x 的正确导入方式
        const pdfParse = await import('pdf-parse');
        const data = await (pdfParse as any).default(file.buffer);
        return data.text;
      } catch (error) {
        this.logger.error('PDF 解析失败:', error);
        throw new Error('PDF 文件解析失败');
      }
    }

    throw new Error('无法提取文件内容，请确保文件格式正确');
  }

  private async fetchContent(url: string): Promise<string> {
    // 从 URL 抓取内容
    return '';
  }

  private async analyzeWithAI(text: string, source?: string): Promise<ParsedResume> {
    // 记录原始文本长度和前500字符预览
    const originalLength = text.length;
    const textPreview = text.substring(0, 500).replace(/\n/g, ' ');
    this.logger.log(`📄 原始简历文本长度: ${originalLength} 字符 (约 ${Math.round(originalLength / 3)} tokens)`);
    this.logger.debug(`📄 文本预览（前500字符）: ${textPreview}...`);

    // 文本截断策略
    const processedText = this.truncateTextIfNeeded(text);
    const finalLength = processedText.length;
    const wasTruncated = finalLength < originalLength;

    if (wasTruncated) {
      this.logger.warn(`⚠️ 简历文本已被截断: ${originalLength} → ${finalLength} 字符`);
    }

    this.logger.log(`🤖 准备调用 AI 解析，最终文本长度: ${finalLength} 字符`);

    const gameKnowledge = await this.getGameKnowledge();

    // 更明确的 Prompt，包含 JSON 模板
    const prompt = `你是游戏行业招聘专家，解析以下简历，提取结构化信息。

游戏引擎知识库：${JSON.stringify(gameKnowledge.engines)}
开发语言：${JSON.stringify(gameKnowledge.languages)}
TA方向：${JSON.stringify(gameKnowledge.taDirections)}
游戏品类：${JSON.stringify(gameKnowledge.gameGenres)}
美术风格：${JSON.stringify(gameKnowledge.artStyles)}

简历内容：
${processedText}

【重要】请严格按照以下JSON格式返回，不要添加任何其他文字：
{
  "name": "候选人姓名（必填）",
  "phoneNumber": "手机号（格式：13812345678）",
  "email": "邮箱地址（必填）",
  "linkedin": "LinkedIn链接",
  "currentTitle": "当前职位",
  "currentCompany": "当前公司",
  "workYears": 工作年限（数字）,
  "skills": {
    "engines": [{"name": "Unity", "level": "expert"}],
    "languages": ["C#", "C++"],
    "taDirection": ["TA"],
    "gameGenres": ["MMO", "RPG"],
    "artStyles": ["写实"]
  },
  "projects": [
    {
      "name": "项目名称",
      "role": "担任角色",
      "status": "released",
      "description": "项目描述"
    }
  ],
  "education": [
    {
      "school": "学校名称",
      "degree": "学位",
      "major": "专业"
    }
  ],
  "portfolio": {
    "github": "GitHub链接",
    "artstation": "ArtStation链接"
  },
  "warnings": ["警告信息列表"]
}

现在请解析上述简历内容，返回JSON格式的结果：`;

    try {
      const aiResult = await this.ai.invoke(prompt);

      // 🔍 调试日志：打印 AI 原始响应
      this.logger.debug(`🤖 AI 原始响应（前500字符）: ${aiResult.substring(0, 500)}...`);
      this.logger.debug(`🤖 AI 响应完整长度: ${aiResult.length} 字符`);

      // 尝试从响应中提取 JSON（处理可能的前后文字）
      const extractedJson = this.extractJSON(aiResult);

      if (!extractedJson) {
        throw new Error('AI 返回内容中未找到有效 JSON');
      }

      // 解析 JSON
      const parsed = JSON.parse(extractedJson);

      // 验证关键字段是否存在
      this.validateParsedData(parsed);

      // 如果文本被截断，添加警告信息
      if (wasTruncated && parsed.warnings) {
        parsed.warnings.push(
          `简历文本过长 (${originalLength} 字符)，已截取前 ${this.MAX_SAFE_CHARS} 字符进行分析，可能影响解析准确性`
        );
      }

      this.logger.log(`✅ AI 解析成功`, {
        name: parsed.name || '未识别',
        email: parsed.email || '未识别',
        phone: parsed.phoneNumber || '未识别',
        skillsCount: (parsed.skills?.engines?.length || 0) + (parsed.skills?.languages?.length || 0),
        projectsCount: parsed.projects?.length || 0,
      });

      return parsed;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ AI 解析失败: ${errorMessage}`);

      // 降级方案：使用正则提取基础信息
      this.logger.warn('🔄 使用降级方案：正则提取基础信息');
      return this.getFallbackParsedData(text, errorMessage);
    }
  }

  /**
   * 从 AI 响应中提取 JSON
   * 处理 AI 可能返回 JSON + 解释文字的情况
   */
  private extractJSON(response: string): string | null {
    // 尝试 1: 直接解析整个响应
    try {
      JSON.parse(response);
      return response;
    } catch {}

    // 尝试 2: 提取第一个 {...} 块
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        JSON.parse(jsonMatch[0]);
        return jsonMatch[0];
      } catch {}
    }

    // 尝试 3: 提取 ```json...``` 代码块
    const codeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        JSON.parse(codeBlockMatch[1]);
        return codeBlockMatch[1];
      } catch {}
    }

    return null;
  }

  /**
   * 验证解析后的数据
   * 确保关键字段存在且有效
   */
  private validateParsedData(data: any): void {
    const warnings: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      warnings.push('候选人姓名为空或无效');
    }

    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
      warnings.push('邮箱地址为空或无效');
    }

    if (!data.skills || typeof data.skills !== 'object') {
      warnings.push('技能数据缺失或格式错误');
    }

    if (warnings.length > 0) {
      this.logger.warn(`⚠️ 解析数据验证发现问题: ${warnings.join(', ')}`);
      if (!data.warnings) {
        data.warnings = [];
      }
      data.warnings.push(...warnings);
    }
  }

  /**
   * 文本截断策略
   * 如果文本超过安全长度，截取前 N 个字符并添加提示
   */
  private truncateTextIfNeeded(text: string): string {
    if (text.length <= this.MAX_SAFE_CHARS) {
      return text;
    }

    // 截取前 MAX_SAFE_CHARS 个字符并添加后缀
    return text.substring(0, this.MAX_SAFE_CHARS) + this.TRUNCATE_SUFFIX;
  }

  /**
   * 降级方案：当 AI 解析失败时，使用正则表达式提取基础信息
   * 尽可能从文本中提取姓名、邮箱、手机、学校等信息
   */
  private getFallbackParsedData(originalText: string, errorMessage: string): ParsedResume {
    this.logger.warn('🔄 使用降级方案：正则表达式提取基础信息');

    // 提取邮箱
    const emailMatch = originalText.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch?.[0] || '';

    // 提取手机号（支持多种格式）
    const phonePatterns = [
      /1[3-9]\d{9}/, // 13812345678
      /\d{3}-\d{4}-\d{4}/, // 138-1234-5678
      /\d{3}\s*\d{4}\s*\d{4}/, // 138 1234 5678
    ];
    let phoneNumber = '';
    for (const pattern of phonePatterns) {
      const match = originalText.match(pattern);
      if (match) {
        phoneNumber = match[0].replace(/[-\s]/g, '');
        break;
      }
    }

    // 提取姓名（尝试多种模式）
    let name = '';
    const namePatterns = [
      /姓名[：:]\s*([^\n\r]{2,10})/,
      /姓\s*名[：:]\s*([^\n\r]{2,10})/,
      /候选人[：:]\s*([^\n\r]{2,10})/,
      /个人简历[：:\s]*([^\n\r]{2,10})/,
    ];
    for (const pattern of namePatterns) {
      const match = originalText.match(pattern);
      if (match && match[1] && match[1].trim()) {
        name = match[1].trim();
        break;
      }
    }

    // 如果没找到姓名，尝试从文本开头提取（常见格式：姓名在最前面）
    if (!name) {
      const firstLineMatch = originalText.match(/^([^\n\r]{2,20})/);
      if (firstLineMatch && !firstLineMatch[1].includes('@') && !firstLineMatch[1].includes('http')) {
        // 过滤掉明显不是姓名的内容
        const possibleName = firstLineMatch[1].trim();
        if (possibleName.length >= 2 && possibleName.length <= 10 && /^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(possibleName)) {
          name = possibleName;
        }
      }
    }

    // 提取学校信息
    const schoolKeywords = ['大学', '学院', 'School', 'University', 'College'];
    const education: Array<{ school: string; degree: string; major: string }> = [];
    for (const keyword of schoolKeywords) {
      const regex = new RegExp(`([^\\n\\r]{2,20}${keyword}[^\n\r]{0,30})`, 'gi');
      const matches = originalText.match(regex);
      if (matches) {
        matches.slice(0, 3).forEach(match => {
          const schoolText = match.trim();
          if (schoolText.length > 3 && schoolText.length < 50) {
            education.push({
              school: schoolText,
              degree: '',
              major: '',
            });
          }
        });
        break;
      }
    }

    // 提取技能关键词
    const skillKeywords = [
      'Unity', 'Unreal', 'Cocos', 'C#', 'C++', 'Java', 'Python', 'JavaScript',
      'React', 'Vue', 'Node', 'Docker', 'Git', 'Linux',
    ];
    const foundSkills: string[] = [];
    const upperText = originalText.toUpperCase();
    for (const skill of skillKeywords) {
      if (upperText.includes(skill.toUpperCase())) {
        foundSkills.push(skill);
      }
    }

    // 提取 GitHub/LinkedIn 链接
    const githubMatch = originalText.match(/github\.com\/[\w-]+/i);
    const linkedinMatch = originalText.match(/linkedin\.com\/[\w-]+/i);

    // 提取工作年限
    let workYears = 0;
    const workYearPatterns = [
      /(\d+)\s*年\s*工作/,
      /工作\s*经验\s*[：:]\s*(\d+)/,
      /(\d+)\s*年\s*经验/,
    ];
    for (const pattern of workYearPatterns) {
      const match = originalText.match(pattern);
      if (match) {
        workYears = parseInt(match[1], 10) || 0;
        break;
      }
    }

    const result: ParsedResume = {
      name,
      phoneNumber,
      email,
      linkedin: linkedinMatch?.[0] || '',
      currentTitle: '',
      currentCompany: '',
      workYears,
      skills: {
        engines: [],
        languages: foundSkills,
        taDirection: [],
        gameGenres: [],
        artStyles: [],
      },
      projects: [],
      education: education.slice(0, 3), // 最多取3个教育经历
      portfolio: {
        github: githubMatch?.[0] || '',
      },
      warnings: [
        `AI 解析失败: ${errorMessage}`,
        '使用正则表达式降级提取基础信息',
        name ? `✅ 已识别姓名: ${name}` : '⚠️ 未能识别姓名',
        email ? `✅ 已识别邮箱: ${email}` : '⚠️ 未能识别邮箱',
        phoneNumber ? `✅ 已识别手机: ${phoneNumber}` : '⚠️ 未能识别手机',
        foundSkills.length > 0 ? `✅ 已识别 ${foundSkills.length} 项技能` : '⚠️ 未能识别技能',
        education.length > 0 ? `✅ 已识别 ${education.length} 个教育经历` : '⚠️ 未能识别教育信息',
        '建议: 请手动填写候选人信息，或稍后重新解析',
      ],
    };

    this.logger.log('📊 降级方案提取结果', {
      name: result.name || '未识别',
      email: result.email || '未识别',
      phone: result.phoneNumber || '未识别',
      skillsCount: result.skills.languages.length,
      educationCount: result.education.length,
    });

    return result;
  }

  private async getGameKnowledge() {
    return {
      engines: ['Unity', 'Unreal Engine 4', 'Unreal Engine 5', 'Cocos', 'LayaBox', '白鹭'],
      languages: ['C#', 'C++', 'Lua', 'GDScript', 'GLSL', 'HLSL'],
      taDirections: ['TA', '3D角色', '3D场景', '2D角色', 'UI特效', '关卡美术'],
      gameGenres: ['MMO', 'RPG', 'SLG', 'FPS', 'MOBA', '休闲', '卡牌', '二次元'],
      artStyles: ['写实', '卡通', '欧美', '日系', '国风', '像素'],
    };
  }

  async checkDuplicate(candidate: ParsedResume): Promise<{ exists: boolean; candidateId?: string }> {
    const existing = await this.prisma.candidate.findFirst({
      where: {
        OR: [
          { phoneNumber: candidate.phoneNumber },
          { email: candidate.email },
          { name: candidate.name },
        ],
      },
    });

    return {
      exists: !!existing,
      candidateId: existing?.id,
    };
  }
}
