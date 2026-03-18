import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 定义需要保护的路由
const _protectedRoutes = [
  '/candidates',
  '/jobs',
  '/applications',
  '/interviews',
  '/resume-upload',
  '/dashboard',
];

// 定义公开路由（不需要认证即可访问）
const _publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/',
];

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // 跳过静态文件和 API 路由（除了 /api/auth/*）
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth'))
    ) {
      return NextResponse.next();
    }

    // 🔧 开发模式：临时禁用认证检查，允许所有路由访问
    // TODO: 生产环境请取消注释下面的代码
    return NextResponse.next();

    /*
    // 检查是否有 token（从 cookie）
    const token = request.cookies.get('auth_token')?.value;

    // 如果访问的是受保护的路由
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // 如果访问的是公开路由
    const isPublicRoute = publicRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // 如果用户已登录且访问登录/注册页面，重定向到首页
    if (token && isPublicRoute && pathname !== '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // 如果用户未登录且访问受保护的路由，重定向到登录页
    if (!token && isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    */
  } catch (error) {
    // 如果 middleware 出错，记录日志但不阻塞请求
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// 配置匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (favicon 文件)
     * - public folder 中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
