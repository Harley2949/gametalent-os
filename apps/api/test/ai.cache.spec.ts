/**
 * AI 服务缓存功能测试
 *
 * 验证 AI 服务的缓存优化是否正常工作
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AiService, MatchResult, CompetitorMapping } from '../src/modules/ai/ai.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { CacheService } from '../src/modules/cache/cache.service';
import { NotFoundException } from '@nestjs/common';

// Mock CacheService
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  has: jest.fn(),
};

// Mock PrismaService
const mockPrismaService = {
  candidate: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  job: {
    findUnique: jest.fn(),
  },
  resume: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  application: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('AiService - 缓存功能测试', () => {
  let service: AiService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  beforeEach(() => {
    // 重置所有 mock
    jest.clearAllMocks();
  });

  describe('calculateMatchScore() - 缓存测试', () => {
    const mockCandidate = {
      id: 'candidate-1',
      email: 'test@example.com',
      name: 'Test User',
      resumes: [
        {
          id: 'resume-1',
          isPrimary: true,
          parsedData: { text: 'resume content' },
        },
      ],
    };

    const mockJob = {
      id: 'job-1',
      title: 'Software Engineer',
      description: 'Job description',
      requirements: 'Requirements',
      targetSkills: ['JavaScript', 'TypeScript'],
    };

    const mockMatchResult: MatchResult = {
      candidateId: 'candidate-1',
      jobId: 'job-1',
      score: 85,
      details: {
        overall: 85,
        skillsMatch: 90,
        experienceMatch: 80,
        educationMatch: 85,
        strengths: ['Strong JS skills'],
        gaps: ['No React experience'],
        recommendation: 'RECOMMEND',
        notes: 'Good fit',
      },
      timestamp: new Date(),
    };

    it('缓存未命中时应调用 Ollama API', async () => {
      // Mock 缓存未命中
      mockCacheService.get.mockResolvedValue(undefined);
      mockCacheService.set.mockResolvedValue(undefined);

      // Mock 数据库查询
      mockPrismaService.candidate.findUnique.mockResolvedValue(mockCandidate as any);
      mockPrismaService.job.findUnique.mockResolvedValue(mockJob as any);
      mockPrismaService.application.findUnique.mockResolvedValue(null);
      mockPrismaService.application.update.mockResolvedValue({} as any);

      // Mock Ollama API 调用
      jest.spyOn(service as any, 'callOllamaInternal').mockResolvedValue(
        JSON.stringify(mockMatchResult.details),
      );
      jest.spyOn(service as any, 'parseMatchScore').mockReturnValue(mockMatchResult.details);

      const startTime = Date.now();
      const result = await service.calculateMatchScore('candidate-1', 'job-1');
      const endTime = Date.now();

      // 验证结果
      expect(result).toEqual(mockMatchResult);

      // 验证缓存操作
      expect(mockCacheService.get).toHaveBeenCalledWith('match:candidate-1:job-1');
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'match:candidate-1:job-1',
        mockMatchResult,
        3600, // 1小时 TTL
      );
    });

    it('缓存命中时应直接返回，不调用 Ollama API', async () => {
      // Mock 缓存命中
      mockCacheService.get.mockResolvedValue(mockMatchResult);

      const startTime = Date.now();
      const result = await service.calculateMatchScore('candidate-1', 'job-1');
      const endTime = Date.now();

      // 验证结果
      expect(result).toEqual(mockMatchResult);

      // 验证缓存操作
      expect(mockCacheService.get).toHaveBeenCalledWith('match:candidate-1:job-1');
      expect(mockCacheService.set).not.toHaveBeenCalled();

      // 验证未调用 Ollama API（通过检查数据库查询次数）
      expect(mockPrismaService.candidate.findUnique).not.toHaveBeenCalled();
    });

    it('缓存命中时性能提升应该明显', async () => {
      // Mock 缓存命中
      mockCacheService.get.mockResolvedValue(mockMatchResult);

      const iterations = 100;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        await service.calculateMatchScore('candidate-1', 'job-1');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 缓存命中时，100 次查询应在 1 秒内完成
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('extractSkills() - 缓存测试', () => {
    const mockResume = {
      id: 'resume-1',
      candidateId: 'candidate-1',
      parsedData: { text: 'resume with skills' },
    };

    const mockSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js'];

    it('缓存未命中时应调用 Ollama API', async () => {
      mockCacheService.get.mockResolvedValue(undefined);
      mockCacheService.set.mockResolvedValue(undefined);
      mockPrismaService.resume.findUnique.mockResolvedValue(mockResume as any);
      mockPrismaService.resume.update.mockResolvedValue({} as any);

      jest.spyOn(service as any, 'callOllamaInternal').mockResolvedValue(
        JSON.stringify(mockSkills),
      );
      jest.spyOn(service as any, 'parseSkillList').mockReturnValue(mockSkills);

      const result = await service.extractSkills('resume-1');

      expect(result).toEqual(mockSkills);
      expect(mockCacheService.get).toHaveBeenCalledWith('skills:resume-1');
      expect(mockCacheService.set).toHaveBeenCalledWith('skills:resume-1', mockSkills, 7200); // 2小时 TTL
    });

    it('缓存命中时应直接返回', async () => {
      mockCacheService.get.mockResolvedValue(mockSkills);

      const result = await service.extractSkills('resume-1');

      expect(result).toEqual(mockSkills);
      expect(mockCacheService.get).toHaveBeenCalledWith('skills:resume-1');
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(mockPrismaService.resume.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('analyzeCompetitorMapping() - 缓存测试', () => {
    const mockResume = {
      id: 'resume-1',
      candidateId: 'candidate-1',
      parsedData: { text: 'worked at Blizzard' },
    };

    const mockCompetitorData: CompetitorMapping = {
      companies: [
        {
          name: 'Blizzard Entertainment',
          projects: ['World of Warcraft'],
          relationship: 'former',
          confidence: 0.9,
        },
      ],
    };

    it('缓存未命中时应调用 Ollama API', async () => {
      mockCacheService.get.mockResolvedValue(undefined);
      mockCacheService.set.mockResolvedValue(undefined);
      mockPrismaService.resume.findUnique.mockResolvedValue(mockResume as any);
      mockPrismaService.candidate.update.mockResolvedValue({} as any);

      jest.spyOn(service as any, 'callOllamaInternal').mockResolvedValue(
        JSON.stringify(mockCompetitorData),
      );
      jest.spyOn(service as any, 'parseCompetitorData').mockReturnValue(mockCompetitorData);

      const result = await service.analyzeCompetitorMapping('resume-1');

      expect(result).toEqual(mockCompetitorData);
      expect(mockCacheService.get).toHaveBeenCalledWith('competitor:resume-1');
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'competitor:resume-1',
        mockCompetitorData,
        86400, // 24小时 TTL
      );
    });

    it('缓存命中时应直接返回', async () => {
      mockCacheService.get.mockResolvedValue(mockCompetitorData);

      const result = await service.analyzeCompetitorMapping('resume-1');

      expect(result).toEqual(mockCompetitorData);
      expect(mockCacheService.get).toHaveBeenCalledWith('competitor:resume-1');
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });
  });

  describe('缓存失效测试', () => {
    it('invalidateResumeCache 应清除相关缓存', async () => {
      await service.invalidateResumeCache('resume-1');

      expect(mockCacheService.del).toHaveBeenCalledWith('skills:resume-1');
      expect(mockCacheService.del).toHaveBeenCalledWith('competitor:resume-1');
    });

    it('invalidateCandidateCache 应记录日志', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'debug');

      await service.invalidateCandidateCache('candidate-1');

      expect(loggerSpy).toHaveBeenCalledWith('清除候选人缓存 [candidate-1]');
    });

    it('invalidateJobCache 应记录日志', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'debug');

      await service.invalidateJobCache('job-1');

      expect(loggerSpy).toHaveBeenCalledWith('清除职位缓存 [job-1]');
    });
  });

  describe('错误处理测试', () => {
    it('候选人不存在时应抛出异常', async () => {
      mockCacheService.get.mockResolvedValue(undefined);
      mockPrismaService.candidate.findUnique.mockResolvedValue(null);

      await expect(
        service.calculateMatchScore('non-existent', 'job-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('职位不存在时应抛出异常', async () => {
      mockCacheService.get.mockResolvedValue(undefined);
      mockPrismaService.candidate.findUnique.mockResolvedValue({
        id: 'candidate-1',
        resumes: [],
      } as any);
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(
        service.calculateMatchScore('candidate-1', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('Ollama API 失败时应抛出异常', async () => {
      mockCacheService.get.mockResolvedValue(undefined);
      mockPrismaService.candidate.findUnique.mockResolvedValue({
        id: 'candidate-1',
        resumes: [{ id: 'resume-1', isPrimary: true }],
      } as any);
      mockPrismaService.job.findUnique.mockResolvedValue({
        id: 'job-1',
        title: 'Engineer',
        description: 'Desc',
        requirements: 'Req',
        targetSkills: [],
      } as any);

      jest.spyOn(service as any, 'callOllamaInternal').mockRejectedValue(
        new Error('Ollama API error'),
      );

      await expect(
        service.calculateMatchScore('candidate-1', 'job-1'),
      ).rejects.toThrow('Ollama API error');
    });
  });

  describe('性能基准测试', () => {
    it('100次缓存命中查询应在 100ms 内完成', async () => {
      const mockResult: MatchResult = {
        candidateId: 'c',
        jobId: 'j',
        score: 80,
        details: {} as any,
        timestamp: new Date(),
      };

      mockCacheService.get.mockResolvedValue(mockResult);

      const iterations = 100;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        await service.calculateMatchScore('c', 'j');
      }

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100);
      console.log(`✅ ${iterations} 次缓存命中查询耗时: ${duration}ms`);
    });

    it('批量匹配性能测试', async () => {
      const mockResult: MatchResult = {
        candidateId: 'c',
        jobId: 'j',
        score: 80,
        details: {} as any,
        timestamp: new Date(),
      };

      // 第一次查询：缓存未命中
      mockCacheService.get.mockResolvedValue(undefined);

      // 后续查询：缓存命中
      mockCacheService.get
        .mockResolvedValueOnce(undefined) // 第一次未命中
        .mockResolvedValue(mockResult); // 后续都命中

      const candidateIds = Array.from({ length: 10 }, (_, i) => `candidate-${i}`);

      const startTime = Date.now();
      await service.batchMatchScores('job-1', candidateIds);
      const duration = Date.now() - startTime;

      console.log(`✅ 批量匹配 ${candidateIds.length} 个候选人耗时: ${duration}ms`);

      // 即使只有第一次未命中，也应该比没有缓存快得多
      expect(duration).toBeLessThan(5000); // 5秒内完成
    });
  });
});
