import { z } from 'zod';

export const RequestCodeSchema = z.object({
    email: z.string().email(),
});

export const ExchangeCodeSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
});

export type RequestCodeDto = z.infer<typeof RequestCodeSchema>;
export type ExchangeCodeDto = z.infer<typeof ExchangeCodeSchema>;
