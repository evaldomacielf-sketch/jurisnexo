import { z } from 'zod';
export declare const RequestCodeSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const ExchangeCodeSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    code: string;
}, {
    email: string;
    code: string;
}>;
export type RequestCodeDto = z.infer<typeof RequestCodeSchema>;
export type ExchangeCodeDto = z.infer<typeof ExchangeCodeSchema>;
//# sourceMappingURL=auth.dto.d.ts.map