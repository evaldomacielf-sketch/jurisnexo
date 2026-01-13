'use server';

import { getAccessToken, getRefreshToken } from './cookies';
import type { JWTPayload, AuthUser } from './types';

import { isTokenExpired } from './jwt';

// ============================================
// 👤 Session Management
// ============================================

const API_URL = process.env.API_URL || 'http://localhost:4000';

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
