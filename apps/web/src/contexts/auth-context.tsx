'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { User, AuthResponse, LoginCredentials, RegisterData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从localStorage加载认证信息
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // 登录
  const login = async (credentials: LoginCredentials) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

    const bodyString = JSON.stringify(credentials);
    console.log('[Auth Context] 发起登录请求:', credentials);
    console.log('[Auth Context] API URL:', `${API_BASE}/api/auth/login`);
    console.log('[Auth Context] Request Body JSON:', bodyString);
    console.log('[Auth Context] Request Body Length:', bodyString.length);

    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 重要：允许接收和发送cookie
      body: bodyString,
    });

    console.log('[Auth Context] 响应状态:', response.status, response.statusText);
    console.log('[Auth Context] 响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Auth Context] 登录失败 - 原始响应:', errorText);
      try {
        const error = JSON.parse(errorText);
        console.error('[Auth Context] 登录失败 - 解析后:', error);
        throw new Error(error.message || '登录失败');
      } catch (e) {
        console.error('[Auth Context] 无法解析错误响应为JSON');
        throw new Error(`登录失败 (${response.status}): ${errorText}`);
      }
    }

    const data: AuthResponse = await response.json();
    console.log('[Auth Context] 登录成功，获取到token，长度:', data.access_token?.length);

    // 保存到state和localStorage
    setToken(data.access_token);
    setUser(data.user);

    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    // 重要：手动设置cookie，以便middleware可以读取
    // 设置cookie为7天有效期
    const maxAge = 7 * 24 * 60 * 60; // 7天（秒）
    const cookieOptions = [
      `auth_token=${data.access_token}`,
      `path=/`,
      `max-age=${maxAge}`,
      `sameSite=lax`
    ].join('; ');

    document.cookie = cookieOptions;

    // 调试：验证cookie是否设置成功
    console.log('[AuthContext] Cookie已设置');
    console.log('[AuthContext] Cookie字符串:', cookieOptions);
    console.log('[AuthContext] 所有Cookie:', document.cookie);
    console.log('[AuthContext] auth_token存在:', document.cookie.includes('auth_token='));
  };

  // 注册
  const register = async (data: RegisterData) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 重要：允许接收和发送cookie
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '注册失败');
    }

    const authData: AuthResponse = await response.json();

    // 保存到state和localStorage
    setToken(authData.access_token);
    setUser(authData.user);

    localStorage.setItem('auth_token', authData.access_token);
    localStorage.setItem('auth_user', JSON.stringify(authData.user));

    // 重要：手动设置cookie，以便middleware可以读取
    const maxAge = 7 * 24 * 60 * 60; // 7天（秒）
    const cookieOptions = [
      `auth_token=${authData.access_token}`,
      `path=/`,
      `max-age=${maxAge}`,
      `sameSite=lax`
    ].join('; ');

    document.cookie = cookieOptions;

    // 调试：验证cookie是否设置成功
    console.log('[AuthContext] 注册后Cookie已设置');
    console.log('[AuthContext] 所有Cookie:', document.cookie);
    console.log('[AuthContext] auth_token存在:', document.cookie.includes('auth_token='));
  };

  // 登出
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // 重要：清除cookie
    document.cookie = 'auth_token=; path=/; max-age=0;';

    // 跳转到登录页（通过 window.location 因为在 AuthContext 中无法使用 useRouter）
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // 刷新token
  const refreshToken = async () => {
    // 实现token刷新逻辑
    // 当前JWT不支持刷新，可以重新登录
    // 或者实现refresh token机制
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
