/**
 * API 函数重构示例
 * 展示如何使用统一的错误处理方案
 */

import { get, post, put, del, upload } from './fetchClient';
import { useErrorHandler } from './hooks/useErrorHandler';

// ==================== 示例 1：在组件中使用 ====================

/**
 * 示例组件：候选人列表页面
 */
export function CandidateListExample() {
  const { handleError, withErrorHandling } = useErrorHandler();

  // 示例 1.1：手动处理错误
  const handleDelete = async (id: string) => {
    try {
      await del(`/api/candidates/${id}`);
      // 删除成功，刷新列表
      console.log('删除成功');
    } catch (error) {
      handleError(error); // 自动显示错误提示
    }
  };

  // 示例 1.2：使用 withErrorHandling 自动处理
  const fetchCandidates = async () => {
    return withErrorHandling(
      () => get('/api/candidates', { skipAuth: false }),
      {
        onSuccess: (data) => {
          console.log('获取候选人列表成功', data);
        },
        onError: (error) => {
          console.error('获取候选人列表失败', error);
        },
      }
    );
  };

  // 示例 1.3：带成功提示
  const handlePublish = async (id: string) => {
    return withErrorHandling(
      () => post(`/api/jobs/${id}/publish`),
      {
        showSuccessToast: true,
        successMessage: '职位发布成功',
        onSuccess: () => {
          // 刷新列表
          console.log('刷新职位列表');
        },
      }
    );
  };

  return null;
}

// ==================== 示例 2：纯 API 函数 ====================

/**
 * 获取候选人列表（重构后）
 */
export async function fetchCandidates(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  tags?: string[];
}) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.tags) queryParams.append('tags', params.tags.join(','));
  queryParams.append('skip', String(((params.page || 1) - 1) * (params.pageSize || 10)));
  queryParams.append('take', String(params.pageSize || 10));

  // 使用统一的 fetchClient，错误会自动处理
  const response = await get(`/api/candidates?${queryParams.toString()}`);

  return {
    data: response.data || response,
    total: response.total || response.length,
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  };
}

/**
 * 获取职位详情（重构后）
 */
export async function fetchJob(id: string) {
  // 直接使用 get 方法，错误会自动抛出
  return get(`/api/jobs/${id}`);
}

/**
 * 创建职位（重构后）
 */
export async function createJob(data: any) {
  return post('/api/jobs', data);
}

/**
 * 更新职位（重构后）
 */
export async function updateJob(id: string, data: any) {
  return put(`/api/jobs/${id}`, data);
}

/**
 * 删除职位（重构后）
 */
export async function deleteJob(id: string) {
  return del(`/api/jobs/${id}`);
}

/**
 * 发布职位（重构后）
 */
export async function publishJob(id: string) {
  return post(`/api/jobs/${id}/publish`);
}

/**
 * 关闭职位（重构后）
 */
export async function closeJob(id: string, reason?: string) {
  return post(`/api/jobs/${id}/close`, reason ? { reason } : {});
}

/**
 * 上传简历（重构后）
 */
export async function uploadResume(file: File, candidateId?: string) {
  const endpoint = candidateId
    ? `/api/resume-upload/candidate/${candidateId}`
    : '/api/resume-upload/upload';

  return upload(endpoint, file);
}

/**
 * 提交面试反馈（重构后）
 */
export async function submitInterviewFeedback(id: string, data: any) {
  return post(`/api/interviews/${id}/feedback`, data);
}

/**
 * 更新应聘状态（重构后）
 */
export async function updateApplicationStatus(id: string, status: string, notes?: string) {
  return put(`/api/applications/${id}/status`, { status, notes });
}

// ==================== 示例 3：高级用法 ====================

/**
 * 批量操作示例
 */
export async function batchUpdateApplicationStatus(ids: string[], status: string) {
  return post('/api/applications/batch/status', { ids, status });
}

/**
 * 带缓存控制的请求
 */
export async function fetchJobsWithCache(params: any) {
  // 使用 next 选项控制缓存
  return get('/api/jobs', {
    next: { revalidate: 60 }, // 缓存 60 秒
  });
}

/**
 * 并发请求示例
 */
export async function fetchDashboardData() {
  const [candidates, jobs, applications] = await Promise.all([
    get('/api/candidates/stats/summary'),
    get('/api/jobs/stats'),
    get('/api/applications/stats/summary'),
  ]);

  return {
    candidates,
    jobs,
    applications,
  };
}

/**
 * 请求取消示例（用于组件卸载时取消请求）
 */
export async function fetchCandidatesWithAbort(
  params: any,
  signal?: AbortSignal
) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);

  // 直接使用 fetchClient，传入 signal
  return fetchClient(
    `/api/candidates?${queryParams.toString()}`,
    {
      method: 'GET',
      signal, // 用于取消请求
    }
  );
}

// 导出 fetchClient 以供高级用法使用
export { fetchClient } from './fetchClient';

// 重新导出错误类型，方便其他模块使用
export * from './errors';
