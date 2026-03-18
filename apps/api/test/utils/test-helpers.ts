/**
 * 测试工具函数库
 *
 * 提供通用的测试辅助函数，避免重复代码
 */

import { PrismaService } from '../../src/modules/prisma/prisma.service';

/**
 * 清理测试数据
 */
export async function cleanupTestData(
  prisma: PrismaService,
  options: {
    emails?: string[];
    models?: Array<'candidate' | 'job' | 'application' | 'interview'>;
  } = {},
) {
  const { emails = [], models = ['candidate', 'job', 'application', 'interview'] } = options;

  // 清理面试
  if (models.includes('interview')) {
    await prisma.interview.deleteMany({
      where: {
        candidate: emails.length > 0 ? { email: { in: emails } } : undefined,
      },
    });
  }

  // 清理应聘记录
  if (models.includes('application')) {
    await prisma.application.deleteMany({
      where: {
        candidate: emails.length > 0 ? { email: { in: emails } } : undefined,
      },
    });
  }

  // 清理职位
  if (models.includes('job')) {
    await prisma.job.deleteMany({
      where: {
        title: {
          contains: '[TEST]',
        },
      },
    });
  }

  // 清理候选人
  if (models.includes('candidate')) {
    await prisma.candidate.deleteMany({
      where: emails.length > 0
        ? { email: { in: emails } }
        : {
            email: {
              contains: 'test',
              mode: 'insensitive',
            },
          },
    });
  }
}

/**
 * 创建测试候选人
 */
export async function createTestCandidate(
  prisma: PrismaService,
  overrides: Partial<{
    email: string;
    name: string;
    tags: string[];
    status: any;
    source: any;
  }> = {},
) {
  return prisma.candidate.create({
    data: {
      email: overrides.email || `test-${Date.now()}@example.com`,
      name: overrides.name || '测试候选人',
      source: overrides.source || 'OTHER',
      status: overrides.status || 'ACTIVE',
      tags: overrides.tags || [],
    },
  });
}

/**
 * 创建测试职位
 */
export async function createTestJob(
  prisma: PrismaService,
  overrides: Partial<{
    title: string;
    description: string;
    status: any;
  }> = {},
) {
  return prisma.job.create({
    data: {
      title: overrides.title || '[TEST] 测试职位',
      description: overrides.description || '这是一个测试职位',
      status: overrides.status || 'DRAFT',
      department: '技术部',
      location: '远程',
      type: 'FULL_TIME',
    },
  });
}

/**
 * 创建测试应聘记录
 */
export async function createTestApplication(
  prisma: PrismaService,
  candidateId: string,
  jobId: string,
  overrides: Partial<{
    status: any;
  }> = {},
) {
  return prisma.application.create({
    data: {
      candidateId,
      jobId,
      status: overrides.status || 'APPLIED',
      source: 'OTHER',
    },
  });
}

/**
 * 等待异步操作完成
 */
export async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机测试数据
 */
export function generateTestData() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);

  return {
    email: `test-${timestamp}-${random}@example.com`,
    name: `测试用户-${timestamp}`,
    phone: `1${random.toString().padStart(10, '0')}`,
  };
}

/**
 * Mock Prisma Service
 */
export function mockPrismaService() {
  return {
    candidate: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  };
}

/**
 * 测试性能辅助函数
 */
export async function measurePerformance<T>(
  fn: () => Promise<T>,
  maxDuration: number,
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  const result = await fn();
  const endTime = Date.now();
  const duration = endTime - startTime;

  expect(duration).toBeLessThan(maxDuration);

  return { result, duration };
}

/**
 * 断言 API 响应格式
 */
export function expectApiResponse(response: any, expectedFields: string[]) {
  expect(response).toBeDefined();
  expect(typeof response).toBe('object');

  expectedFields.forEach(field => {
    expect(response).toHaveProperty(field);
  });
}
