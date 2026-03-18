/**
 * 类型安全的 API 客户端
 * 为常用 API 端点提供预定义的类型和方法
 */

import { fetchClient, ApiResponse } from './fetchClient';
import type { Candidate, CreateCandidateDto, UpdateCandidateDto } from '@/types/candidate';
import type { Application, CreateApplicationDto, UpdateApplicationDto, QueryApplicationsDto } from '@/types/application';

// ========== Candidates API ==========

export const candidatesApi = {
  /**
   * 获取候选人列表
   */
  list: async (params: {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.set('skip', params.skip.toString());
    if (params.take) queryParams.set('take', params.take.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.status) queryParams.set('status', params.status);

    const response = await fetchClient<
      ApiResponse<{
        data: Candidate[];
        meta: { total: number; skip: number; take: number; hasMore: boolean };
      }>
    >(`/api/candidates?${queryParams.toString()}`);

    return response.data;
  },

  /**
   * 获取候选人详情
   */
  get: async (id: string) => {
    const response = await fetchClient<ApiResponse<Candidate>>(
      `/api/candidates/${id}`
    );
    return response.data;
  },

  /**
   * 创建候选人
   */
  create: async (data: CreateCandidateDto) => {
    const response = await fetchClient<ApiResponse<Candidate>>(
      '/api/candidates',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  /**
   * 更新候选人
   */
  update: async (id: string, data: UpdateCandidateDto) => {
    const response = await fetchClient<ApiResponse<Candidate>>(
      `/api/candidates/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  /**
   * 删除候选人
   */
  delete: async (id: string) => {
    const response = await fetchClient<ApiResponse<{ success: boolean }>>(
      `/api/candidates/${id}`,
      {
        method: 'DELETE',
      }
    );
    return response.data;
  },

  /**
   * 批量删除候选人
   */
  batchDelete: async (ids: string[]) => {
    const response = await fetchClient<
      ApiResponse<{ success: number; failed: number }>
    >('/api/candidates/batch', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
    return response.data;
  },

  /**
   * 更新候选人状态
   */
  updateStatus: async (id: string, status: Candidate['status']) => {
    const response = await fetchClient<ApiResponse<Candidate>>(
      `/api/candidates/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
    return response.data;
  },

  /**
   * 添加标签
   */
  addTags: async (id: string, tags: string[]) => {
    const response = await fetchClient<ApiResponse<Candidate>>(
      `/api/candidates/${id}/tags`,
      {
        method: 'POST',
        body: JSON.stringify({ tags }),
      }
    );
    return response.data;
  },
};

// ========== Applications API ==========

export const applicationsApi = {
  /**
   * 获取应聘列表
   */
  list: async (params: QueryApplicationsDto = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.set('skip', params.skip.toString());
    if (params.take !== undefined) queryParams.set('take', params.take.toString());
    if (params.jobId) queryParams.set('jobId', params.jobId);
    if (params.candidateId) queryParams.set('candidateId', params.candidateId);
    if (params.status) queryParams.set('status', params.status);
    if (params.source) queryParams.set('source', params.source);

    const response = await fetchClient<
      ApiResponse<{
        data: Application[];
        meta: { total: number; skip: number; take: number; hasMore: boolean };
      }>
    >(`/api/applications?${queryParams.toString()}`);

    return response.data;
  },

  /**
   * 获取应聘详情
   */
  get: async (id: string) => {
    const response = await fetchClient<ApiResponse<Application>>(
      `/api/applications/${id}`
    );
    return response.data;
  },

  /**
   * 创建应聘记录
   */
  create: async (data: CreateApplicationDto) => {
    const response = await fetchClient<ApiResponse<Application>>(
      '/api/applications',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  /**
   * 更新应聘信息
   */
  update: async (id: string, data: UpdateApplicationDto) => {
    const response = await fetchClient<ApiResponse<Application>>(
      `/api/applications/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  /**
   * 更新应聘状态
   */
  updateStatus: async (
    id: string,
    data: { status: Application['status']; notes?: string }
  ) => {
    const response = await fetchClient<ApiResponse<Application>>(
      `/api/applications/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  /**
   * 删除应聘记录
   */
  delete: async (id: string) => {
    const response = await fetchClient<ApiResponse<{ success: boolean }>>(
      `/api/applications/${id}`,
      {
        method: 'DELETE',
      }
    );
    return response.data;
  },

  /**
   * 批量更新状态
   */
  batchUpdateStatus: async (
    ids: string[],
    status: Application['status']
  ) => {
    const response = await fetchClient<
      ApiResponse<{ success: number; failed: number }>
    >('/api/applications/batch/status', {
      method: 'POST',
      body: JSON.stringify({ ids, status }),
    });
    return response.data;
  },

  /**
   * 筛选候选人
   */
  screen: async (id: string, data: {
    screeningScore: number;
    screeningNotes?: string;
  }) => {
    const response = await fetchClient<ApiResponse<Application>>(
      `/api/applications/${id}/screen`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },
};

// ========== Auth API ==========

export const authApi = {
  /**
   * 登录
   */
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetchClient<
      ApiResponse<{
        access_token: string;
        user: {
          id: string;
          email: string;
          name: string;
          role: string;
        };
      }>
    >('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data;
  },

  /**
   * 注册
   */
  register: async (data: {
    email: string;
    password: string;
    name: string;
  }) => {
    const response = await fetchClient<
      ApiResponse<{
        access_token: string;
        user: {
          id: string;
          email: string;
          name: string;
          role: string;
        };
      }>
    >('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /**
   * 获取当前用户信息
   */
  me: async () => {
    const response = await fetchClient<
      ApiResponse<{
        id: string;
        email: string;
        name: string;
        role: string;
      }>
    >('/api/auth/me');
    return response.data;
  },
};

// 导出所有 API
export const api = {
  candidates: candidatesApi,
  applications: applicationsApi,
  auth: authApi,
};
