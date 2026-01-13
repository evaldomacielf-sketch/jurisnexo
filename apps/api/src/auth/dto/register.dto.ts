import { z } from 'zod';

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2),
    phone: z.string().optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
