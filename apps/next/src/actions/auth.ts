'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth/cookies';
import type {
    LoginDTO,
    RegisterDTO,
    ForgotPasswordDTO,
    ResetPasswordDTO,
    ActionResponse,
    LoginResponse,
    RegisterResponse,
    AuthTokens,
} from '@/lib/auth/types';

// ============================================
// 🚀 Server Actions - Authentication
// ============================================

const BASE_URL = process.env.API_URL || 'http://127.0.0.1:4000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

/**
 * 🔐 LOGIN - Autentica usuário e setta cookies
 */
export async function loginAction(
    data: LoginDTO
): Promise<ActionResponse<LoginResponse>> {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.message || 'Credenciais inválidas',
                code: error.code,
            };
        }

        const result = await response.json();

        // Standardize token name
        const accessToken = result.token || result.accessToken;
        const refreshToken = result.refreshToken;

        // Standardize user properties
        const user = result.user ? {
            ...result.user,
            emailVerified: result.user.isEmailVerified ?? result.user.emailVerified,
        } : undefined;

        // Setta tokens em HTTP-only cookies
        await setAuthCookies({
            accessToken,
            refreshToken,
        });

        // Revalida o cache
        revalidatePath('/', 'layout');

        return {
            success: true,
            data: {
                ...result,
                token: accessToken,
                accessToken,
                user
            }
        };
    } catch (error) {
        console.error('[Auth] Login error:', error);
        return {
            success: false,
            error: `Login Error: ${error instanceof Error ? error.message : String(error)} (URL: ${API_URL})`,
        };
    }
}

/**
 * 📝 REGISTER - Cria nova conta + tenant
 */
export async function registerAction(
    data: RegisterDTO
): Promise<ActionResponse<RegisterResponse>> {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.message || 'Erro ao criar conta',
                code: error.code,
            };
        }

        const result: RegisterResponse = await response.json();

        return { success: true, data: result };
    } catch (error) {
        console.error('[Auth] Register error:', error);
        return {
            success: false,
            error: `Erro: ${error instanceof Error ? error.message : String(error)} (URL: ${API_URL})`,
        };
    }
}

/**
 * 🚪 LOGOUT - Remove cookies e redireciona
 */
export async function logoutAction(): Promise<void> {
    await clearAuthCookies();
    revalidatePath('/', 'layout');
    redirect('/auth/login');
}

/**
 * 📧 FORGOT PASSWORD - Envia email de recuperação
 */
export async function forgotPasswordAction(
    data: ForgotPasswordDTO
): Promise<ActionResponse<{ message: string }>> {
    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.message || 'Erro ao enviar email',
            };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('[Auth] Forgot password error:', error);
        return {
            success: false,
            error: 'Erro ao conectar com o servidor.',
        };
    }
}

/**
 * 🔑 RESET PASSWORD - Redefine senha com token
 */
export async function resetPasswordAction(
    data: ResetPasswordDTO
): Promise<ActionResponse<{ message: string }>> {
    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.message || 'Token inválido ou expirado',
            };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('[Auth] Reset password error:', error);
        return {
            success: false,
            error: 'Erro ao conectar com o servidor.',
        };
    }
}

/**
 * ✉️ RESEND VERIFICATION - Reenvia email de verificação
 */
export async function resendVerificationAction(
    email: string
): Promise<ActionResponse<{ message: string }>> {
    try {
        // Note: This endpoint (auth/resend-verification) was NOT implemented in backend yet.
        // I should warn the user or just keep it here as placeholder for future.
        // But adhering to strict instruction, I will add it.
        const response = await fetch(`${API_URL}/auth/resend-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.message || 'Erro ao enviar email',
            };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('[Auth] Resend verification error:', error);
        return {
            success: false,
            error: 'Erro ao conectar com o servidor.',
        };
    }
}

/**
 * 🔄 REFRESH TOKEN - Renova tokens
 */
export async function refreshTokenAction(
    refreshToken: string
): Promise<ActionResponse<AuthTokens>> {
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            return {
                success: false,
                error: 'Sessão expirada. Faça login novamente.',
            };
        }

        const result = await response.json();
        const tokens: AuthTokens = {
            accessToken: result.accessToken || result.token,
            refreshToken: result.refreshToken,
        };

        // Atualiza cookies
        await setAuthCookies(tokens);

        return { success: true, data: tokens };
    } catch (error) {
        console.error('[Auth] Refresh token error:', error);
        return {
            success: false,
            error: 'Erro ao renovar sessão.',
        };
    }
}
/**
 * ✅ VERIFY EMAIL - Verifica email com token
 */
export async function verifyEmailAction(
    token: string
): Promise<ActionResponse<{ message: string }>> {
    try {
        const response = await fetch(`${API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.message || 'Token inválido ou expirado',
            };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('[Auth] Verify email error:', error);
        return {
            success: false,
            error: 'Erro ao conectar com o servidor.',
        };
    }
}
