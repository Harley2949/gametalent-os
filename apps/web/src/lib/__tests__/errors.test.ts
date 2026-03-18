/**
 * 工具函数单元测试
 */

import { describe, it, expect } from '@jest/globals';
import { getUserFriendlyMessage, createApiError, extractFieldErrors } from '../errors';

describe('错误处理工具', () => {
  describe('getUserFriendlyMessage', () => {
    it('应该返回认证错误的友好消息', () => {
      const error = createApiError(401, '未授权');
      const message = getUserFriendlyMessage(error);
      expect(message).toBe('您还未登录，请先登录');
    });

    it('应该返回无效凭证的友好消息', () => {
      const error = createApiError(401, 'Invalid credentials');
      expect(error.message).toBe('未授权，请先登录');
    });

    it('应该返回网络错误的友好消息', () => {
      const error = createApiError(0, 'Network error');
      const message = getUserFriendlyMessage(error);
      expect(message).toBe('网络连接失败，请检查网络设置');
    });

    it('应该返回默认错误消息', () => {
      const error = new Error('Unknown error');
      const message = getUserFriendlyMessage(error);
      expect(message).toBe('Unknown error');
    });
  });

  describe('createApiError', () => {
    it('应该创建 404 错误', () => {
      const error = createApiError(404);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('NotFoundError');
      expect(error.statusCode).toBe(404);
    });

    it('应该创建 401 认证错误', () => {
      const error = createApiError(401);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('AuthError');
      expect(error.statusCode).toBe(401);
    });

    it('应该创建 500 服务器错误', () => {
      const error = createApiError(500);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ServerError');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('extractFieldErrors', () => {
    it('应该从错误详情中提取字段错误', () => {
      const error = createApiError(400, 'Validation failed', {
        errors: {
          email: ['邮箱格式不正确', '邮箱已被注册'],
          password: ['密码强度不够'],
        },
      });

      const fieldErrors = extractFieldErrors(error);

      expect(fieldErrors).toEqual({
        email: '邮箱格式不正确',
        password: '密码强度不够',
      });
    });

    it('应该处理没有错误详情的情况', () => {
      const error = createApiError(400, 'Bad request');
      const fieldErrors = extractFieldErrors(error);
      expect(fieldErrors).toBeNull();
    });

    it('应该处理空错误数组', () => {
      const error = createApiError(400, 'Validation failed', {
        errors: {
          email: [],
        },
      });

      const fieldErrors = extractFieldErrors(error);
      expect(fieldErrors).toBeNull();
    });
  });
});
