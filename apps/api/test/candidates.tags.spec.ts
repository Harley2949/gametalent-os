/**
 * 标签查询性能测试
 *
 * 验证 getAllTags() 方法的优化效果
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesService } from '../src/modules/candidates/candidates.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { CandidateStatus, CandidateSource } from '@prisma/client';

describe('CandidatesService - getAllTags() 性能测试', () => {
  let service: CandidatesService;
  let prisma: PrismaService;

  // 测试数据
  const testCandidates = [
    {
      email: 'test1@example.com',
      name: '测试用户1',
      source: CandidateSource.OTHER,
      status: CandidateStatus.ACTIVE,
      tags: ['unity', 'c#', 'game-dev'],
    },
    {
      email: 'test2@example.com',
      name: '测试用户2',
      source: CandidateSource.OTHER,
      status: CandidateStatus.ACTIVE,
      tags: ['unity', 'unreal', 'c++'],
    },
    {
      email: 'test3@example.com',
      name: '测试用户3',
      source: CandidateSource.OTHER,
      status: CandidateStatus.ACTIVE,
      tags: ['unity', 'python', 'ai'],
    },
    {
      email: 'test4@example.com',
      name: '已归档用户',
      source: CandidateSource.OTHER,
      status: CandidateStatus.ARCHIVED,
      tags: ['unity', 'archived-tag'],
    },
    {
      email: 'test5@example.com',
      name: '测试用户5',
      source: CandidateSource.OTHER,
      status: CandidateStatus.ACTIVE,
      tags: ['web-dev', 'react', 'typescript'],
    },
  ];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidatesService, PrismaService],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
    prisma = module.get<PrismaService>(PrismaService);

    // 清理测试数据
    await cleanupTestData();

    // 创建测试数据
    for (const candidate of testCandidates) {
      try {
        await prisma.candidate.create({ data: candidate });
      } catch (error) {
        // 忽略重复创建错误
      }
    }
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  async function cleanupTestData() {
    await prisma.candidate.deleteMany({
      where: {
        email: {
          in: testCandidates.map(c => c.email),
        },
      },
    });
  }

  describe('基础功能测试', () => {
    it('应该返回所有标签（包括归档用户）', async () => {
      const result = await service.getAllTags({ excludeArchived: false });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);

      // 验证返回格式
      result.forEach(item => {
        expect(item).toHaveProperty('tag');
        expect(item).toHaveProperty('count');
        expect(typeof item.tag).toBe('string');
        expect(typeof item.count).toBe('number');
        expect(item.count).toBeGreaterThan(0);
      });
    });

    it('应该默认排除已归档用户', async () => {
      const resultIncludeArchived = await service.getAllTags({ excludeArchived: false });
      const resultExcludeArchived = await service.getAllTags({ excludeArchived: true });

      // 排除归档后，'archived-tag' 应该不存在或计数减少
      const archivedTag = resultExcludeArchived.find(t => t.tag === 'archived-tag');
      expect(archivedTag).toBeUndefined();
    });

    it('应该正确统计标签出现次数', async () => {
      const result = await service.getAllTags({ excludeArchived: true });

      // 'unity' 在活跃用户中出现了 3 次
      const unityTag = result.find(t => t.tag === 'unity');
      expect(unityTag).toBeDefined();
      expect(unityTag?.count).toBe(3);
    });

    it('应该按使用次数降序排列', async () => {
      const result = await service.getAllTags({ excludeArchived: true });

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].count).toBeGreaterThanOrEqual(result[i + 1].count);
      }
    });
  });

  describe('参数过滤测试', () => {
    it('应该支持 minCount 参数', async () => {
      const result = await service.getAllTags({
        excludeArchived: true,
        minCount: 2,
      });

      result.forEach(item => {
        expect(item.count).toBeGreaterThanOrEqual(2);
      });
    });

    it('应该支持 limit 参数', async () => {
      const limit = 5;
      const result = await service.getAllTags({
        excludeArchived: true,
        limit,
      });

      expect(result.length).toBeLessThanOrEqual(limit);
    });

    it('应该支持同时使用多个过滤参数', async () => {
      const result = await service.getAllTags({
        excludeArchived: true,
        minCount: 1,
        limit: 3,
      });

      expect(result.length).toBeLessThanOrEqual(3);
      result.forEach(item => {
        expect(item.count).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内完成查询（< 100ms）', async () => {
      const startTime = Date.now();

      await service.getAllTags({ excludeArchived: true });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
    });

    it('大数据量场景性能测试', async () => {
      // 创建 100 个测试候选人，每个有 5 个标签
      const batchSize = 100;
      const tagsPerCandidate = 5;
      const commonTags = ['javascript', 'typescript', 'react', 'nodejs', 'python'];

      const createPromises = [];
      for (let i = 0; i < batchSize; i++) {
        const tags = [];
        for (let j = 0; j < tagsPerCandidate; j++) {
          tags.push(commonTags[Math.floor(Math.random() * commonTags.length)]);
        }
        tags.push(`unique-tag-${i}`);

        createPromises.push(
          prisma.candidate.create({
            data: {
              email: `perf-test-${i}@example.com`,
              name: `性能测试用户${i}`,
              source: CandidateSource.OTHER,
              status: CandidateStatus.ACTIVE,
              tags,
            },
          }),
        );
      }

      await Promise.all(createPromises);

      const startTime = Date.now();
      const result = await service.getAllTags({ excludeArchived: true });
      const endTime = Date.now();

      // 清理性能测试数据
      await prisma.candidate.deleteMany({
        where: {
          email: {
            startsWith: 'perf-test-',
          },
        },
      });

      const duration = endTime - startTime;

      console.log(`查询 ${batchSize} 个候选人（每个 ${tagsPerCandidate} 个标签）耗时: ${duration}ms`);
      console.log(`返回标签数量: ${result.length}`);

      // 性能要求：即使在大数据量下，也应在 500ms 内完成
      expect(duration).toBeLessThan(500);
    });
  });

  describe('边界条件测试', () => {
    it('应该正确处理空标签数组', async () => {
      await prisma.candidate.create({
        data: {
          email: 'empty-tags@example.com',
          name: '空标签用户',
          source: CandidateSource.OTHER,
          status: CandidateStatus.ACTIVE,
          tags: [],
        },
      });

      const result = await service.getAllTags({ excludeArchived: true });

      // 不应该返回空标签
      const emptyTag = result.find(t => t.tag === '');
      expect(emptyTag).toBeUndefined();
    });

    it('应该正确处理 minCount 大于实际值的情况', async () => {
      const result = await service.getAllTags({
        excludeArchived: true,
        minCount: 9999,
      });

      expect(result).toEqual([]);
    });

    it('应该正确处理 limit 为 0 的情况', async () => {
      const result = await service.getAllTags({
        excludeArchived: true,
        limit: 0,
      });

      expect(result).toEqual([]);
    });
  });

  describe('SQL 注入防护测试', () => {
    it('应该正确处理特殊字符标签', async () => {
      await prisma.candidate.create({
        data: {
          email: 'special-chars@example.com',
          name: '特殊字符用户',
          source: CandidateSource.OTHER,
          status: CandidateStatus.ACTIVE,
          tags: ["tag'with'quotes", 'tag;with;semicolons', 'tag--with--dashes'],
        },
      });

      const result = await service.getAllTags({ excludeArchived: true });

      // 验证特殊字符被正确处理
      expect(result.some(t => t.tag === "tag'with'quotes")).toBe(true);
      expect(result.some(t => t.tag === 'tag;with;semicolons')).toBe(true);
      expect(result.some(t => t.tag === 'tag--with--dashes')).toBe(true);
    });
  });
});
