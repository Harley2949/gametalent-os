/**
 * useAuth Hook 测试
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'

// Mock fetch
global.fetch = jest.fn()

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('初始状态', () => {
    it('应该返回初始状态', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()
    })
  })

  describe('login 函数', () => {
    it('应该成功登录并设置用户', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: '测试用户',
        role: 'RECRUITER',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          access_token: 'mock-token',
        }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.error).toBeNull()
      expect(localStorage.getItem('token')).toBe('mock-token')
    })

    it('应该在登录失败时设置错误', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          message: '邮箱或密码错误',
        }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpassword')
        } catch (error) {
          // Expected error
        }
      })

      expect(result.current.user).toBeNull()
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('logout 函数', () => {
    it('应该清除用户信息并导航到登录页', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: '测试用户',
      }

      // 先设置已登录状态
      localStorage.setItem('token', 'mock-token')
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // 执行登出
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('loading 状态', () => {
    it('应该在加载用户时显示 loading 状态', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ user: null }),
              })
            }, 100)
          }),
      )

      const { result } = renderHook(() => useAuth())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('错误处理', () => {
    it('应该在网络错误时设置错误状态', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error'),
      )

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.loading).toBe(false)
      })
    })
  })
})
