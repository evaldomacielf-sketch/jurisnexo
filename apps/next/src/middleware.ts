import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================
// 🛡️ Authentication Middleware
// ============================================

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'jurisnexo_session';
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'jurisnexo_refresh';

/**
 * Rotas públicas (não requerem autenticação)
 */
const PUBLIC_ROUTES = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
];

/**
 * Rotas de autenticação (redireciona se já autenticado)
 */
const AUTH_ROUTES = [
    '/auth/login',
    '/auth/register',
];

/**
 * Verifica se a rota é pública
 */
function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Verifica se a rota é de autenticação
 */
function isAuthRoute(pathname: string): boolean {
    return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Decodifica JWT (simples, sem validação de assinatura)
 */
function decodeJWT(token: string): { exp: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString('utf-8')
        );

        return payload;
    } catch {
        return null;
    }
}

/**
 * Verifica se o token está expirado
 */
function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
}

/**
 * Renova o access token usando o refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        const BASE_URL = process.env.API_URL || 'http://localhost:4000';
        const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

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

/**
 * 🛡️ Middleware Principal
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Permite acesso a arquivos estáticos e API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get(COOKIE_NAME)?.value;
    const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

    const hasValidToken = accessToken && !isTokenExpired(accessToken);

    // ✅ Usuário autenticado tentando acessar rotas de auth
    if (hasValidToken && isAuthRoute(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // ✅ Rota pública - permite acesso
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // ❌ Sem token - redireciona para login
    if (!accessToken) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 🔄 Token expirado - tenta renovar
    if (isTokenExpired(accessToken) && refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);

        if (newAccessToken) {
            // Renovou com sucesso - atualiza cookie e continua
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
            // Falha ao renovar - redireciona para login
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

/**
 * Configuração de rotas protegidas
 */
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
