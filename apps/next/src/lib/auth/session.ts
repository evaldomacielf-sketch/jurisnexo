'use server';

import { getAccessToken, getRefreshToken } from './cookies';
import type { JWTPayload, AuthUser } from './types';

const API_URL = process.env.API_URL || 'http://localhost:4000';

function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        return payload as JWTPayload;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
}

/**
 * 👤 Recupera o usuário atual da sessão
 * CRÍTICO: Não redireciona, apenas retorna null se inválido
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            console.log('[Session] No access token found');
            return null;
        }

        // Verifica expiração localmente (otimização)
        if (isTokenExpired(accessToken)) {
            console.log('[Session] Token expired');
            return null;
        }

        // ✅ CRÍTICO: Adicionar timeout para evitar travamento
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error('[Session] Error fetching user:', response.status);
            return null;
        }

        const user: AuthUser = await response.json();
        return user;
    } catch (error) {
        // ✅ CRÍTICO: Captura erro de timeout
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('[Session] Request timeout');
        } else {
            console.error('[Session] Error fetching current user:', error);
        }
        return null;
    }
}

export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}

export async function isEmailVerified(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.emailVerified ?? false;
}

export async function getTokensForRefresh() {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();
    return { accessToken, refreshToken };
}
