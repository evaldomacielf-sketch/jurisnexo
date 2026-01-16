import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    tenantName: z.string().min(2, 'Nome do escritório é obrigatório'),
});

export const resetPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
});

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>;

export interface AuthTokenDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthUserDto {
    id: string;
    email: string;
    fullName: string;
    role: string;
    tenantId: string;
    tenantName: string;
}
