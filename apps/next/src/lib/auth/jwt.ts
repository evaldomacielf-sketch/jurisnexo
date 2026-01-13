import type { JWTPayload } from './types';

// ============================================
// 🔐 JWT Utilities (Synchronous/Shared)
// ============================================

/**
 * 🔓 Decodifica JWT (simples, sem validação de assinatura)
 * A validação real acontece no backend
 */
export function decodeJWT(token: string): JWTPayload | null {
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
