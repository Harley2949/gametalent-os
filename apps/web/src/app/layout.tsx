import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ToastProvider } from '@/components/shared/Toast';
import { ConditionalNavbar } from '@/components/ConditionalNavbar';

export const metadata: Metadata = {
  title: 'GameTalent OS - 游戏行业 AI 原生招聘系统',
  description: '专为游戏行业打造的 AI 驱动智能招聘系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <ToastProvider>
            <ConditionalNavbar />
            <main className="min-h-screen">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
