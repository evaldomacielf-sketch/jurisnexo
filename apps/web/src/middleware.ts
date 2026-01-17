import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cookie name for JWT auth (matches lib/auth/cookies.ts)
const AUTH_COOKIE_NAME = 'jurisnexo_session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get auth cookie
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasSession = !!token;
  const isLogout = req.nextUrl.searchParams.get('logout') === 'true';

  // If logout param is present, delete cookie and continue to login
  if (isLogout) {
    const response = NextResponse.next();

    // Aggressive cookie clearing
    response.cookies.delete(AUTH_COOKIE_NAME);
    response.cookies.set(AUTH_COOKIE_NAME, '', { maxAge: 0, path: '/' });

    // Prevent caching of this response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  }

  // Legacy redirect
  if (pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify',
    '/invites',
    '/',
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // If no session and not public route, redirect to login
  if (!hasSession && !isPublicRoute) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If has session and trying to access auth pages or landing, go to dashboard
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (hasSession && (isAuthRoute || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
