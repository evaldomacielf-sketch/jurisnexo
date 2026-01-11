import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'lawyer', 'secretary', 'paralegal']);

export const createUserSchema = z.object({
    email: z.string().email('Email inválido'),
    fullName: z.string().min(2, 'Nome é obrigatório'),
    role: userRoleSchema.default('lawyer'),
    oabNumber: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial();

export type UserRole = z.infer<typeof userRoleSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export interface UserDto {
    id: string;
    tenantId: string;
    email: string;
    fullName: string;
    role: UserRole;
    oabNumber?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}
