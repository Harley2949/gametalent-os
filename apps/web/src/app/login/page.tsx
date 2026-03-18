'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Mail, Lock, Sparkles, Crown, User, ArrowRight, Loader2 } from 'lucide-react';
import { TypewriterTitle } from '@/components/TypewriterText';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@gametalent.os');  // 管理员测试账号
  const [password, setPassword] = useState('admin123');  // 正确密码
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/');
    } catch (err: any) {
      // 根据错误类型提供更友好的提示
      if (err.message?.includes('网络') || err.code === 'ECONNREFUSED') {
        setError('网络连接失败，请检查网络后重试');
      } else if (err.message?.includes('密码') || err.status === 401) {
        setError('邮箱或密码错误，请重新输入');
      } else if (err.message?.includes('账号')) {
        setError('账号不存在或已被禁用');
      } else {
        setError(err.message || '登录失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 overflow-hidden relative">
      {/* 微光背景粒子 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-40 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* 左侧品牌区 - 60% */}
      <div className="hidden lg:flex lg:w-[60%] items-center justify-center p-16 relative z-10">
        {/* Logo - 固定在左上角 */}
        <div className="absolute top-12 left-12 flex items-center gap-3 z-20">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-800">GameTalent</span>
            <span className="text-2xl font-bold text-violet-600 ml-1">OS</span>
          </div>
        </div>

        {/* 核心内容 - 居中 */}
        <div className="relative z-10 text-center space-y-10 max-w-4xl">
          {/* 超大标题 - 打字机动画 */}
          <div className="space-y-6">
            <TypewriterTitle />

            {/* 装饰线 */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-violet-400 to-transparent"></div>
              <div className="h-2 w-2 bg-violet-500 rounded-full"></div>
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-violet-400 to-transparent"></div>
            </div>

            {/* 副标题 */}
            <p className="text-xl font-semibold text-slate-700 leading-relaxed">
              专为游戏行业打造的{' '}
              <span className="text-violet-600 font-bold">原生智能招聘引擎</span>
            </p>

            {/* 特性标签 */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                ✨ AI 驱动
              </span>
              <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium border border-violet-200">
                🎮 游戏垂直
              </span>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200">
                🚀 效率提升
              </span>
            </div>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="absolute bottom-8 left-12">
          <p className="text-sm text-slate-500">© 2026 GameTalent OS · Power by AI</p>
        </div>
      </div>

      {/* 右侧登录表单区 - 40% */}
      <div className="flex-1 lg:w-[40%] flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* 登录卡片 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-8">
            {/* 标题区 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl mb-4 shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">欢迎回来</h2>
              <p className="text-slate-600">登录到您的 GameTalent OS 账户</p>
            </div>

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* 邮箱输入框 */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">
                  邮箱地址
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50/50 focus:bg-white"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* 密码输入框 */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50/50 focus:bg-white"
                    placeholder="•••••••••••"
                  />
                </div>
              </div>

              {/* 记住我 & 忘记密码 */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 text-violet-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-violet-500 focus:ring-offset-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700 transition-colors duration-200">
                    记住我
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors duration-200"
                >
                  忘记密码？
                </a>
              </div>

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>登录中...</span>
                  </>
                ) : (
                  <>
                    <span>立即登录</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* 分割线 */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-semibold">快速体验</span>
              </div>
            </div>

            {/* 测试账号 - 使用真实存在的账号 */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@gametalent.os');
                  setPassword('admin123');
                }}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl hover:from-blue-100 hover:to-violet-100 transition-all duration-200 border-2 border-transparent hover:border-blue-300 group"
              >
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-200">管理员</p>
                  <p className="text-xs text-slate-500 font-mono">admin@gametalent.os</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('hr@gametalent.os');
                  setPassword('hr123456');
                }}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl hover:from-violet-100 hover:to-purple-100 transition-all duration-200 border-2 border-transparent hover:border-violet-300 group"
              >
                <div className="h-12 w-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors duration-200">HR</p>
                  <p className="text-xs text-slate-500 font-mono">hr@gametalent.os</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all duration-200" />
              </button>
            </div>

            {/* 底部提示 */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                登录即表示您同意我们的{' '}
                <a href="#" className="text-violet-600 hover:text-violet-700 underline underline-offset-4">服务条款</a>
                {' '}和{' '}
                <a href="#" className="text-violet-600 hover:text-violet-700 underline underline-offset-4">隐私政策</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端提示 */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              MiAO AI Native
            </span>
          </h1>
          <p className="text-slate-700 mb-8">专为游戏行业打造的智能招聘引擎</p>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
            <p className="text-slate-700 text-sm">请使用桌面端设备访问以获得最佳体验</p>
          </div>
        </div>
      </div>
    </div>
  );
}
