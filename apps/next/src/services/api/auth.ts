```typescript
import { apiClient, handleApiError } from './client';
import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    User,
    VerifyEmailData,
    ResetPasswordData
} from '@/types/auth';

export const authApi = {
    /**
     * Login com email e senha
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Registro de novo usuário
     */
    async register(registerData: RegisterData): Promise<AuthResponse> {
        try {
            const { data } = await apiClient.post<AuthResponse>('/auth/register', registerData);
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Verifica email com código de 6 dígitos
     */
    async verifyEmail(verifyData: VerifyEmailData): Promise<{ success: boolean }> {
        try {
            const { data } = await apiClient.post('/auth/verify-email', verifyData);
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Reenvia código de verificação
     */
    async resendVerificationCode(email: string): Promise<{ success: boolean }> {
        try {
            const { data } = await apiClient.post('/auth/resend-verification', { email });
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Solicita reset de senha
     */
    async requestPasswordReset(email: string): Promise<{ success: boolean }> {
        try {
            const { data } = await apiClient.post('/auth/forgot-password', { email });
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Reseta senha com token
     */
    async resetPassword(resetData: ResetPasswordData): Promise<{ success: boolean }> {
        try {
            const { data } = await apiClient.post('/auth/reset-password', resetData);
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Obtém perfil do usuário autenticado
     */
    async getProfile(): Promise<User> {
        try {
            const { data } = await apiClient.get<User>('/auth/profile');
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Atualiza perfil do usuário
     */
    async updateProfile(updates: Partial<User>): Promise<User> {
        try {
            const { data } = await apiClient.patch<User>('/auth/profile', updates);
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Logout (invalida token no backend)
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            // Silencioso - logout local sempre funciona
            console.error('Erro ao fazer logout no servidor:', error);
        }
    },

    /**
     * Refresh token
     */
    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            const { data } = await apiClient.post<AuthResponse>('/auth/refresh', {
                refresh_token: refreshToken,
            });
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },
};
