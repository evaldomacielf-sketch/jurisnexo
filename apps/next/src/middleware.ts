import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'jurisnexo_session';
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'jurisnexo_refresh';

const PUBLIC_ROUTES = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
];

const AUTH_ROUTES = ['/auth/login', '/auth/register'];

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
    return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function decodeJWT(token: string): { exp: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        return payload;
    } catch {
        return null;
    }
}

function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        const API_URL = process.env.API_URL || 'http://localhost:4000';
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return null;
        const { accessToken } = await response.json();
        return accessToken;
    } catch (error) {
        console.error('[Middleware] Error refreshing token:', error);
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ✅ CRÍTICO: Permitir arquivos estáticos e API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') // Arquivos com extensão (CSS, JS, etc)
    ) {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get(COOKIE_NAME)?.value;
    const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

    const hasValidToken = accessToken && !isTokenExpired(accessToken);

    // ✅ Usuário autenticado tentando acessar rotas de auth → redireciona para dashboard
    if (hasValidToken && isAuthRoute(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // ✅ Rota pública - permite acesso
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // ❌ Sem token - redireciona para login (APENAS UMA VEZ)
    if (!accessToken) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 🔄 Token expirado - tenta renovar
    if (isTokenExpired(accessToken) && refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);

        if (newAccessToken) {
            const response = NextResponse.next();
            response.cookies.set(COOKIE_NAME, newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 900, // 15 minutos
                path: '/',
            });
            return response;
        } else {
            // Falha ao renovar - limpa cookies e redireciona
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            loginUrl.searchParams.set('session_expired', 'true');

            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete(COOKIE_NAME);
            response.cookies.delete(REFRESH_COOKIE_NAME);

            return response;
        }
    }

    // ✅ Token válido - permite acesso
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
