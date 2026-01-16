// ============================================
// 🔐 Authentication Types
// ============================================

/**
 * Estrutura dos tokens retornados pela API NestJS
 */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

/**
 * Dados do usuário autenticado
 */
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    status: 'active' | 'inactive';
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    tenantId?: string; // Added to support new client logic
    tenant?: {
        name: string;
        slug: string;
    };
}

/**
 * Sessão completa (incluindo tenant)
 */
export interface Session {
    user: AuthUser;
    tokens: AuthTokens;
    tenant?: {
        id: string;
        name: string;
        slug: string;
        primaryColor: string;
        logo?: string;
        plan: 'TRIAL' | 'PRO' | 'ENTERPRISE';
        trialEndsAt?: string;
    };
}

/**
 * Payload do JWT decodificado
 */
export interface JWTPayload {
    sub: string; // userId
    email: string;
    tenantId?: string;
    iat: number;
    exp: number;
}

/**
 * Resposta de Login da API
 */
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
}

export type AuthResponse = LoginResponse; // Alias for new code

/**
 * Resposta de Register da API
 */
export interface RegisterResponse {
    user: AuthUser;
    message: string;
}

/**
 * DTOs para formulários
 */
export interface LoginDTO {
    email: string;
    password: string;
}

export type LoginCredentials = LoginDTO; // Alias

export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    tenantSlug: string; // Será gerado automaticamente do nome do escritório
    tenantName: string; // Nome do escritório
}

export type RegisterData = RegisterDTO; // Alias

export interface ForgotPasswordDTO {
    email: string;
}

export interface ResetPasswordDTO {
    token: string;
    password: string;
}

export type ResetPasswordData = ResetPasswordDTO; // Alias

export interface VerifyEmailData {
    email: string;
    code: string;
}

// User alias for compatibility
export type User = AuthUser;

/**
 * Respostas de ações
 */
export type ActionResponse<T = void> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string };
