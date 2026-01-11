import { z } from 'zod';

export const caseStatusSchema = z.enum(['lead', 'triagem', 'analise', 'contrato', 'ativo', 'arquivado']);
export const casePrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const caseAreaSchema = z.enum([
    'civil',
    'trabalhista',
    'criminal',
    'familia',
    'imobiliario',
    'tributario',
    'empresarial',
    'consumidor',
    'previdenciario',
    'outro',
]);

export const createCaseSchema = z.object({
    title: z.string().min(3, 'Título é obrigatório'),
    description: z.string().optional(),
    clientId: z.string().uuid('ID do cliente inválido'),
    status: caseStatusSchema.default('lead'),
    priority: casePrioritySchema.default('medium'),
    area: caseAreaSchema,
    assignedTo: z.string().uuid().optional(),
    processNumber: z.string().optional(),
    estimatedValue: z.number().positive().optional(),
});

export const updateCaseSchema = createCaseSchema.partial();

export type CaseStatus = z.infer<typeof caseStatusSchema>;
export type CasePriority = z.infer<typeof casePrioritySchema>;
export type CaseArea = z.infer<typeof caseAreaSchema>;
export type CreateCaseDto = z.infer<typeof createCaseSchema>;
export type UpdateCaseDto = z.infer<typeof updateCaseSchema>;

export interface CaseDto {
    id: string;
    tenantId: string;
    title: string;
    description?: string;
    clientId: string;
    clientName: string;
    status: CaseStatus;
    priority: CasePriority;
    area: CaseArea;
    assignedTo?: string;
    assignedToName?: string;
    processNumber?: string;
    estimatedValue?: number;
    createdAt: string;
    updatedAt: string;
}
