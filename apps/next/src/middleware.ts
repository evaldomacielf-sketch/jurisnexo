import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Renovar sessão se expirada (o helper cuida de setar os cookies na response se necessário)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Redireciona antigo /auth/login para o novo /login
  if (pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify',
    '/invites',
    '/',
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Se não tem sessão e não é rota pública, redireciona para login
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Se tem sessão e está tentando acessar páginas de auth ou landing page, vai pro dashboard
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (session && (isAuthRoute || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
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
