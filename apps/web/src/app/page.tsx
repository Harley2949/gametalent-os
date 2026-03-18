import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block px-4 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium border border-violet-200">
            AI 原生智能招聘系统
          </div>
          <h2 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            专为{' '}
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
              游戏行业
            </span>
            {' '}打造
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            利用 AI 驱动的简历匹配、竞对公司图谱和梯度透明度机制，彻底改变您的招聘流程。
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link
              href="/resume-upload"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg font-medium shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              上传简历
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              控制台
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border-2 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">竞对公司图谱</h3>
            <p className="text-slate-600 dark:text-slate-400">
              自动追踪和映射候选人与竞对公司之间的关系，实现战略性招聘。
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border-2 border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200">
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">AI 智能匹配</h3>
            <p className="text-slate-600 dark:text-slate-400">
              基于 Ollama 本地部署的大语言模型，提供高级简历分析和职位匹配功能。
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border-2 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">隐私与安全</h3>
            <p className="text-slate-600 dark:text-slate-400">
              梯度透明度控制和私有化部署选项，保护敏感招聘数据。
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p className="font-medium">GameTalent OS - 游戏行业 AI 原生招聘系统</p>
        </div>
      </footer>
    </div>
  );
}
