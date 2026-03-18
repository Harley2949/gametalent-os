'use client';

import { Button } from '@gametalent/ui';
import { cn } from '@gametalent/ui';
import { Briefcase, Users, Calendar, FileText, LogOut, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/contexts/auth-context';


export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    {
      href: '/candidates',
      icon: Users,
      label: '候选人',
    },
    {
      href: '/jobs',
      icon: Briefcase,
      label: '职位',
    },
    {
      href: '/applications',
      icon: ClipboardList,
      label: '应聘',
    },
    {
      href: '/interviews',
      icon: Calendar,
      label: '面试',
    },
    {
      href: '/resume-upload',
      icon: FileText,
      label: '简历上传',
    },
  ];

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">
              GameTalent OS
            </span>
          </Link>

          {/* Navigation */}
          {/* 开发模式：始终显示导航按钮（生产环境请改回 isAuthenticated &&） */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">登出</span>
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">
                  登录
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
