'use server';

import { getAccessToken, getRefreshToken } from './cookies';
import type { JWTPayload, AuthUser } from './types';

// ============================================
// 👤 Session Management
// ============================================

const API_URL = process.env.API_URL || 'http://localhost:4000';

/**
 * 🔓 Decodifica JWT (simples, sem validação de assinatura)
 * A validação real acontece no backend
 */
function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString('utf-8')
        );

        return payload as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * ⏱️ Verifica se o token está expirado
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    // Buffer de 10 segundos para evitar race condition
    return payload.exp < (now + 10);
}

/**
 * 👤 Recupera o usuário atual da sessão
 * - Valida o token no backend
 * - Retorna null se inválido/expirado
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const accessToken = await getAccessToken();

    if (!accessToken) {
        return null;
    }

    // Verifica expiração localmente (otimização)
    if (isTokenExpired(accessToken)) {
        return null;
    }

    try {
        // Note: This fetch assumes the backend returns { user: AuthUser } or just AuthUser.
        // AuthController.getMe returns { user: ... }.
        // So distinct from types.AuthUser alone. 
        // I should check AuthController.
        // AuthController.getMe -> { user }
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.user as AuthUser;
    } catch (error) {
        console.error('[Session] Error fetching current user:', error);
        return null;
    }
}

/**
 * ✅ Verifica se o usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}

/**
 * 📧 Verifica se o email foi verificado
 */
export async function isEmailVerified(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.emailVerified ?? false;
}

/**
 * 🔄 Recupera tokens para refresh
 */
export async function getTokensForRefresh() {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    return { accessToken, refreshToken };
}
