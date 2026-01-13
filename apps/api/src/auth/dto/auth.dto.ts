import { z } from 'zod';

export const RequestCodeSchema = z.object({
    email: z.string().email(),
});

export const ExchangeCodeSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2),
    phone: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(6),
});

// For cases where cookie is not available (e.g. mobile app later)
export const RefreshTokenSchema = z.object({
    refreshToken: z.string(),
});

export type RequestCodeDto = z.infer<typeof RequestCodeSchema>;
export type ExchangeCodeDto = z.infer<typeof ExchangeCodeSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

