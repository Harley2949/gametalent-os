'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();

  // 在登录页、注册页等认证页面不显示 Navbar
  const noNavbarRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const shouldShowNavbar = !noNavbarRoutes.some(route => pathname.startsWith(route));

  if (!shouldShowNavbar) {
    return null;
  }

  return <Navbar />;
}
