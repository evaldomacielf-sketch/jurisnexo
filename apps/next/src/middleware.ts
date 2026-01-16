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
    const payloadPart = parts[1];
    if (!payloadPart) return null;

    // Base64Url to Base64
    let base64Payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if necessary
    const pad = base64Payload.length % 4;
    if (pad) {
      if (pad === 1) return null;
      base64Payload += new Array(5 - pad).join('=');
    }

    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch (error) {
    console.error('[Middleware] JWT Decode Error:', error);
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  // exp is in seconds, Date.now() is in ms
  const now = Math.floor(Date.now() / 1000);

  // Add a small buffer (30 seconds) to prevent edge-case race conditions
  return payload.exp < (now + 30);
}

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
    const data = await response.json();
    return data.accessToken || data.token; // Handle both property names
  } catch (error) {
    console.error('[Middleware] Error refreshing token:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  const hasValidToken = accessToken && !isTokenExpired(accessToken);

  // If authenticated and trying to access auth pages OR the landing page, go to dashboard
  if (hasValidToken && (isAuthRoute(pathname) || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isTokenExpired(accessToken) && refreshToken) {
    const newAccessToken = await refreshAccessToken(refreshToken);

    if (newAccessToken) {
      const response = NextResponse.next();
      response.cookies.set(COOKIE_NAME, newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 900,
        path: '/',
      });
      return response;
    } else {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('session_expired', 'true');

      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      response.cookies.delete(REFRESH_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/login|auth/register|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
