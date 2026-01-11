import { z } from 'zod';

export const createTenantSchema = z.object({
    name: z.string().min(2, 'Nome do escritório é obrigatório'),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens').optional(),
    plan: z.enum(['trial', 'basic', 'pro', 'enterprise']).default('trial'),
});

export const updateTenantSchema = createTenantSchema.partial();

export type CreateTenantDto = z.infer<typeof createTenantSchema>;
export type UpdateTenantDto = z.infer<typeof updateTenantSchema>;

export interface TenantDto {
    id: string;
    name: string;
    slug: string;
    plan: 'trial' | 'basic' | 'pro' | 'enterprise';
    createdAt: string;
    updatedAt: string;
}
