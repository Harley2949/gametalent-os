'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@gametalent/ui';
import { Input } from '@gametalent/ui';
import { Label } from '@gametalent/ui';
import { ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = searchParams.get('redirect') || '/candidates';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '登录失败' }));
        throw new Error(errorData.message || '登录失败');
      }

      const data = await response.json();

      // 保存到 localStorage
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      // 跳转
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-8 lg:px-12">
      {/* 标题 */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来</h2>
        <p className="text-gray-600">登录到您的账户</p>
      </div>

      {/* 登录表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 错误提示 */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">登录失败</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* 邮箱 */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
            邮箱地址
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="pl-10 h-11"
            />
          </div>
        </div>

        {/* 密码 */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
            密码
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="•••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="pl-10 h-11"
            />
          </div>
        </div>

        {/* 记住我 & 忘记密码 */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-600">记住我</span>
          </label>
          <a
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            忘记密码？
          </a>
        </div>

        {/* 登录按钮 */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              登录中...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              登录
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      {/* 测试账号 */}
      <div className="mt-12 pt-8 border-t">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
          测试账号
        </p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setEmail('demo@test.com');
              setPassword('demo123');
            }}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">管</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">测试管理员</p>
                <p className="text-xs text-gray-500 font-mono">demo@test.com</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* 注册链接 */}
      <div className="mt-8 text-center text-sm text-gray-600">
        还没有账户？{' '}
        <a
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          立即注册
        </a>
      </div>
    </div>
  );
}
