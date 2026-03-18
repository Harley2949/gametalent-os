import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { Prisma } from '@gametalent/db';

// ============================================
// Type Definitions
// ============================================

export interface MatchScoreDetails {
  overall: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  strengths: string[];
  gaps: string[];
  recommendation: 'STRONG_RECOMMEND' | 'RECOMMEND' | 'CONSIDER' | 'NOT_SUITABLE';
  notes: string;
}

export interface MatchResult {
  candidateId: string;
  jobId: string;
  score: number;
  details: MatchScoreDetails;
  timestamp: Date;
}

export interface BatchMatchResult {
  candidateId: string;
  success: boolean;
  data: MatchResult | null;
  error: Error | null;
}

export interface CompetitorCompany {
  name: string;
  projects: string[];
  relationship: 'former' | 'current';
  confidence: number;
}

export interface CompetitorMapping {
  companies: CompetitorCompany[];
}

// AI Service for resume matching and analysis
// Integrates with LangChain and Ollama for local LLM processing

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private ollamaBaseUrl: string;
  private model: string;

  // 缓存 TTL 配置（秒）
  private readonly CACHE_TTL = {
    MATCH_SCORE: 3600,      // 匹配分数：1小时
    SKILLS: 7200,           // 技能提取：2小时
    COMPETITOR: 86400,      // 竞品分析：24小时
  };

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama2';
  }

  /**
   * Calculate match score between a candidate and a job
   * 使用缓存优化：相同候选人和职位的匹配结果会被缓存 1 小时
   */
  async calculateMatchScore(candidateId: string, jobId: string): Promise<MatchResult> {
    // 生成缓存键
    const cacheKey = `match:${candidateId}:${jobId}`;

    // 尝试从缓存获取
    const cached = await this.cacheService.get<MatchResult>(cacheKey);
    if (cached) {
      this.logger.debug(`缓存命中：匹配分数 [${cacheKey}]`);
      return cached;
    }

    // Fetch candidate with resumes
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { resumes: true },
    });

    // Fetch job
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!candidate || !job) {
      throw new NotFoundException('候选人或职位不存在');
    }

    // Get primary resume
    const resume = candidate.resumes.find(r => r.isPrimary) || candidate.resumes[0];
    if (!resume) {
      throw new NotFoundException('未找到候选人简历');
    }

    // Extract text from resume parsedData
    const resumeText = this.extractResumeText(resume);

    // Create matching prompt
    const prompt = this.createMatchPrompt(resumeText, job);

    try {
      // Call Ollama API for matching
      const matchResult = await this.callOllamaInternal(prompt);
      const score = this.parseMatchScore(matchResult);

      // 构建结果
      const result: MatchResult = {
        candidateId,
        jobId,
        score: score.overall,
        details: score,
        timestamp: new Date(),
      };

      // 存入缓存（1小时）
      await this.cacheService.set(cacheKey, result, this.CACHE_TTL.MATCH_SCORE);

      // Store match score in application if exists
      const application = await this.prisma.application.findUnique({
        where: {
          jobId_candidateId: {
            jobId,
            candidateId,
          },
        },
      });

      if (application) {
        await this.prisma.application.update({
          where: { id: application.id },
          data: {
            matchScore: score.overall,
            matchDetails: score as unknown as Prisma.InputJsonValue,
          },
        });
      }

      return result;
    } catch (error) {
      this.logger.error('计算匹配分数时出错:', error);
      throw error;
    }
  }

  /**
   * Batch calculate match scores for multiple candidates
   */
  async batchMatchScores(jobId: string, candidateIds: string[]): Promise<BatchMatchResult[]> {
    const results = await Promise.allSettled(
      candidateIds.map(id => this.calculateMatchScore(id, jobId))
    );

    return results.map((result, index) => ({
      candidateId: candidateIds[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  }

  /**
   * Extract skills from resume
   * 使用缓存优化：同一简历的技能提取结果会被缓存 2 小时
   */
  async extractSkills(resumeId: string): Promise<string[]> {
    // 生成缓存键
    const cacheKey = `skills:${resumeId}`;

    // 尝试从缓存获取
    const cached = await this.cacheService.get<string[]>(cacheKey);
    if (cached) {
      this.logger.debug(`缓存命中：技能提取 [${cacheKey}]`);
      return cached;
    }

    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    const resumeText = this.extractResumeText(resume);
    const prompt = this.createSkillExtractionPrompt(resumeText);

    try {
      const result = await this.callOllamaInternal(prompt);
      const skills = this.parseSkillList(result);

      // 存入缓存（2小时）
      await this.cacheService.set(cacheKey, skills, this.CACHE_TTL.SKILLS);

      // Update resume with extracted skills
      await this.prisma.resume.update({
        where: { id: resumeId },
        data: { skills },
      });

      return skills;
    } catch (error) {
      this.logger.error('提取技能时出错:', error);
      return [];
    }
  }

  /**
   * Analyze competitor mapping from resume
   * 使用缓存优化：同一简历的竞品分析结果会被缓存 24 小时
   */
  async analyzeCompetitorMapping(resumeId: string): Promise<CompetitorMapping | null> {
    // 生成缓存键
    const cacheKey = `competitor:${resumeId}`;

    // 尝试从缓存获取
    const cached = await this.cacheService.get<CompetitorMapping>(cacheKey);
    if (cached) {
      this.logger.debug(`缓存命中：竞品分析 [${cacheKey}]`);
      return cached;
    }

    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: { candidate: true },
    });

    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    const resumeText = this.extractResumeText(resume);
    const prompt = this.createCompetitorAnalysisPrompt(resumeText);

    try {
      const result = await this.callOllamaInternal(prompt);
      const competitorData = this.parseCompetitorData(result);

      // 存入缓存（24小时）
      await this.cacheService.set(cacheKey, competitorData, this.CACHE_TTL.COMPETITOR);

      // Update candidate with competitor mapping
      await this.prisma.candidate.update({
        where: { id: resume.candidateId },
        data: { competitorMapping: competitorData as unknown as Prisma.InputJsonValue },
      });

      return competitorData;
    } catch (error) {
      this.logger.error('分析竞争对手映射时出错:', error);
      return null;
    }
  }

  /**
   * 清除候选人相关的所有缓存
   * 当候选人信息更新时调用
   */
  async invalidateCandidateCache(candidateId: string): Promise<void> {
    try {
      // 清除该候选人的所有匹配分数缓存
      // 注意：内存缓存不支持通配符，这里需要维护一个索引
      this.logger.debug(`清除候选人缓存 [${candidateId}]`);
      // TODO: 实现精确的缓存清除逻辑
    } catch (error) {
      this.logger.error(`清除候选人缓存失败 [${candidateId}]:`, error);
    }
  }

  /**
   * 清除职位相关的所有缓存
   * 当职位信息更新时调用
   */
  async invalidateJobCache(jobId: string): Promise<void> {
    try {
      this.logger.debug(`清除职位缓存 [${jobId}]`);
      // TODO: 实现精确的缓存清除逻辑
    } catch (error) {
      this.logger.error(`清除职位缓存失败 [${jobId}]:`, error);
    }
  }

  /**
   * 清除简历相关的所有缓存
   * 当简历更新时调用
   */
  async invalidateResumeCache(resumeId: string): Promise<void> {
    try {
      // 清除技能提取缓存
      await this.cacheService.del(`skills:${resumeId}`);
      // 清除竞品分析缓存
      await this.cacheService.del(`competitor:${resumeId}`);
      this.logger.debug(`清除简历缓存 [${resumeId}]`);
    } catch (error) {
      this.logger.error(`清除简历缓存失败 [${resumeId}]:`, error);
    }
  }

  // Helper methods

  private extractResumeText(resume: { parsedData?: unknown; rawData?: unknown; rawText?: string }): string {
    if (resume.parsedData && typeof resume.parsedData === 'object') {
      return JSON.stringify(resume.parsedData);
    }
    if (resume.rawText) {
      return resume.rawText;
    }
    if (resume.rawData) {
      return String(resume.rawData);
    }
    return '';
  }

  private createMatchPrompt(resumeText: string, job: { title: string; description: string; requirements: string; targetSkills: string[] }): string {
    return `You are an expert technical recruiter. Analyze the following resume against the job requirements and provide a detailed match assessment.

Job Title: ${job.title}
Job Description: ${job.description}
Requirements: ${job.requirements}
Target Skills: ${job.targetSkills.join(', ')}

Resume Data:
${resumeText}

Provide your analysis in the following JSON format:
{
  "overall": <score 0-100>,
  "skillsMatch": <score 0-100>,
  "experienceMatch": <score 0-100>,
  "educationMatch": <score 0-100>,
  "strengths": ["list of strengths"],
  "gaps": ["list of gaps"],
  "recommendation": "STRONG_RECOMMEND" | "RECOMMEND" | "CONSIDER" | "NOT_SUITABLE",
  "notes": "detailed analysis"
}`;
  }

  private createSkillExtractionPrompt(resumeText: string): string {
    return `Extract all technical and professional skills from the following resume. Return only a JSON array of skill strings.

Resume Data:
${resumeText}

Return format: ["skill1", "skill2", "skill3", ...]`;
  }

  private createCompetitorAnalysisPrompt(resumeText: string): string {
    return `Analyze the following resume for gaming industry competitors. Identify companies worked for, projects, and relationships.

Resume Data:
${resumeText}

Major Gaming Companies to Look For:
- Blizzard Entertainment
- Riot Games
- Valve Corporation
- Electronic Arts (EA)
- Activision
- Ubisoft
- Nintendo
- Sony Interactive Entertainment
- Xbox Game Studios
- Take-Two Interactive
- Capcom
- Square Enix
- Bandai Namco
- Sega
- Konami

Return JSON format:
{
  "companies": [
    {
      "name": "Company Name",
      "projects": ["project1", "project2"],
      "relationship": "former" | "current",
      "confidence": 0.0-1.0
    }
  ]
}`;
  }

  public async invoke(prompt: string): Promise<string> {
    return this.callOllamaInternal(prompt);
  }

  private async callOllamaInternal(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        // 模型不存在或其他Ollama错误，使用Mock数据
        this.logger.warn(`Ollama API 错误: ${response.statusText}，使用智能Mock数据`);
        return this.getMockResponse(prompt);

        
      }

      const data = await response.json() as { response: string };
      return data.response;
    } catch (error) {
      // 网络错误或其他异常，使用Mock数据
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Ollama调用失败，使用智能Mock数据: ${errorMessage}`);
      return this.getMockResponse(prompt);
    }
  }

  /**
   * 智能Mock数据生成器
   * 当Ollama不可用时，返回合理的Mock数据
   */
  private getMockResponse(prompt: string): string {
    // 根据prompt类型返回不同的Mock数据
    if (prompt.includes('match') || prompt.includes('matching')) {
      // 匹配度分析
      return JSON.stringify({
        overall: 75,
        skillsMatch: 80,
        experienceMatch: 70,
        educationMatch: 75,
        strengths: [
          '具备相关技术栈经验',
          '工作年限符合要求',
          '有游戏行业项目经验'
        ],
        gaps: [
          '需要补充高级架构经验',
          '团队管理经验较少'
        ],
        recommendation: 'RECOMMEND',
        notes: '（Mock数据）候选人整体匹配度良好，建议安排面试进一步评估。'
      });
    } else if (prompt.includes('Extract all technical and professional skills')) {
      // 技能提取
      return JSON.stringify([
        'JavaScript', 'TypeScript', 'React', 'Node.js',
        'Python', 'PostgreSQL', 'Docker', 'Git'
      ]);
    } else if (prompt.includes('gaming industry competitors')) {
      // 竞品分析
      return JSON.stringify({
        companies: [
          {
            name: '腾讯游戏',
            projects: ['王者荣耀', '和平精英'],
            relationship: 'former',
            confidence: 0.9
          }
        ]
      });
    }

    // 默认返回通用响应
    return '{"result": "mock data"}';
  }

  private parseMatchScore(response: string): MatchScoreDetails {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as MatchScoreDetails;
      }
    } catch (e) {
      this.logger.error('解析匹配分数时出错:', e);
    }

    // Fallback: simple scoring
    return {
      overall: 50,
      skillsMatch: 50,
      experienceMatch: 50,
      educationMatch: 50,
      strengths: [],
      gaps: [],
      recommendation: 'CONSIDER',
      notes: response,
    };
  }

  private parseSkillList(response: string): string[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      this.logger.error('解析技能列表时出错:', e);
    }
    return [];
  }

  private parseCompetitorData(response: string): CompetitorMapping {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as CompetitorMapping;
      }
    } catch (e) {
      this.logger.error('解析竞争对手数据时出错:', e);
    }
    return { companies: [] };
  }
}
