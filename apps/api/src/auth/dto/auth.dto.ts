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

export type RequestCodeDto = z.infer<typeof RequestCodeSchema>;
export type ExchangeCodeDto = z.infer<typeof ExchangeCodeSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;

