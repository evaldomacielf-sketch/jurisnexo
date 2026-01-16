import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Instância principal do Axios com interceptors configurados
 */
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor de Request - Adiciona token JWT automaticamente
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().token;

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Adiciona tenant_id ao header se disponível
        const tenantId = useAuthStore.getState().user?.tenant_id;
        if (tenantId && config.headers) {
            config.headers['X-Tenant-ID'] = tenantId;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Interceptor de Response - Trata erros globais
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            useAuthStore.getState().logout();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        if (error.response?.status === 403) {
            // Sem permissão
            console.error('Acesso negado:', error.response.data);
        }

        if (error.response?.status === 429) {
            // Rate limit
            console.error('Muitas requisições. Tente novamente mais tarde.');
        }

        return Promise.reject(error);
    }
);

export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || 'Erro desconhecido na API';
    }
    if (error instanceof Error) return error.message;
    return 'Ocorreu um erro inesperado';
};
