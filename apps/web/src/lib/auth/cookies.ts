'use server';

import { cookies } from 'next/headers';
import type { AuthTokens } from './types';

// ============================================
// 🍪 Cookie Configuration
// ============================================

const COOKIE_CONFIG = {
    AUTH_NAME: process.env.AUTH_COOKIE_NAME || 'jurisnexo_session',
    REFRESH_NAME: process.env.REFRESH_COOKIE_NAME || 'jurisnexo_refresh',
    AUTH_MAX_AGE: parseInt(process.env.AUTH_COOKIE_MAX_AGE || '900'), // 15 min
    REFRESH_MAX_AGE: parseInt(process.env.REFRESH_COOKIE_MAX_AGE || '604800'), // 7 dias
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: 'lax' as const,
} as const;

/**
 * 🔐 Setta os tokens em HTTP-only cookies
 * - Protege contra XSS
 * - Facilita SSR e Server Components
 */
export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
    const cookieStore = await cookies();

    // Access Token (curta duração)
    cookieStore.set(COOKIE_CONFIG.AUTH_NAME, tokens.accessToken, {
        httpOnly: true,
        secure: COOKIE_CONFIG.SECURE,
        sameSite: COOKIE_CONFIG.SAME_SITE,
        maxAge: COOKIE_CONFIG.AUTH_MAX_AGE,
        path: '/',
    });

    // Refresh Token (longa duração)
    cookieStore.set(COOKIE_CONFIG.REFRESH_NAME, tokens.refreshToken, {
        httpOnly: true,
        secure: COOKIE_CONFIG.SECURE,
        sameSite: COOKIE_CONFIG.SAME_SITE,
        maxAge: COOKIE_CONFIG.REFRESH_MAX_AGE,
        path: '/',
    });
}

/**
 * 📖 Recupera o Access Token do cookie
 */
export async function getAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_CONFIG.AUTH_NAME)?.value;
}

/**
 * 🔄 Recupera o Refresh Token do cookie
 */
export async function getRefreshToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_CONFIG.REFRESH_NAME)?.value;
}

/**
 * 🗑️ Remove todos os cookies de autenticação
 */
export async function clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.delete(COOKIE_CONFIG.AUTH_NAME);
    cookieStore.delete(COOKIE_CONFIG.REFRESH_NAME);
}

/**
 * ✅ Verifica se há tokens válidos
 */
export async function hasAuthCookies(): Promise<boolean> {
    const accessToken = await getAccessToken();
    return !!accessToken;
}
