import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { leadsApi } from '@/services/api/leads';
import { crmApi } from '@/services/api/crm';
import { toast } from 'sonner';

const createLeadSchema = z.object({
    title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
    description: z.string().optional(),
    contact_id: z.string().uuid('Selecione um contato'),
    stage_id: z.string().uuid('Selecione um estágio'),
    estimated_value: z.coerce.number().min(0, 'Valor deve ser positivo'),
    probability: z.coerce.number().min(0).max(100, 'Probabilidade deve estar entre 0 e 100'),
    source: z.enum(['website', 'referral', 'social_media', 'event', 'cold_call', 'whatsapp', 'other']),
    priority: z.enum(['low', 'medium', 'high', 'very_high']),
    assigned_to_user_id: z.string().uuid().optional(),
    expected_close_date: z.string().optional(),
    next_follow_up_date: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

type CreateLeadFormData = z.infer<typeof createLeadSchema>;

interface CreateLeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pipelineId: string;
}

export function CreateLeadDialog({ open, onOpenChange, pipelineId }: CreateLeadDialogProps) {
    const queryClient = useQueryClient();

    // Ensuring form defaults match the schema requirements and UI needs
    const form = useForm<CreateLeadFormData>({
        resolver: zodResolver(createLeadSchema),
        defaultValues: {
            title: '',
            description: '',
            estimated_value: 0,
            probability: 50,
            source: 'whatsapp',
            priority: 'medium',
            // contact_id and stage_id should be undefined nicely/handled by Zod as standard required fields
            // z.string().uuid() technically requires a valid string, so empty string '' triggers error which is good for validation.
        },
    });

    // Fetch pipeline para obter stages
    const { data: pipeline } = useQuery({
        queryKey: ['pipeline', pipelineId],
        queryFn: () => leadsApi.getPipeline(pipelineId),
        enabled: open,
    });

    // Fetch contacts
    const { data: contactsData } = useQuery({
        queryKey: ['contacts'],
        queryFn: () => crmApi.getContacts({ limit: 1000 }),
        enabled: open,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateLeadFormData) =>
            leadsApi.createLead({
                ...data,
                pipeline_id: pipelineId,
                currency: 'BRL',
            }),
        onSuccess: () => {
            toast.success('Lead criado com sucesso');
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            onOpenChange(false);
            form.reset();
        },
        onError: () => {
            toast.error('Erro ao criar lead');
        },
    });

    const onSubmit = (data: CreateLeadFormData) => {
        createMutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Lead</DialogTitle>
                    <DialogDescription>
                        Adicione um novo lead ao funil de vendas
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Consultoria Trabalhista - Empresa XYZ" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detalhes sobre a oportunidade..."
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Contact */}
                        <FormField
                            control={form.control}
                            name="contact_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente/Contato *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um contato" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {contactsData?.items.map((contact) => ( // Using .items for PaginatedResponse
                                                <SelectItem key={contact.id} value={contact.id}>
                                                    {contact.name} - {contact.phone}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Stage */}
                        <FormField
                            control={form.control}
                            name="stage_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estágio Inicial *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um estágio" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {pipeline?.stages
                                                .sort((a, b) => a.position - b.position)
                                                .map((stage) => (
                                                    <SelectItem key={stage.id} value={stage.id}>
                                                        {stage.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Value & Probability */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="estimated_value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Estimado (R$) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="probability"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Probabilidade (%) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" max="100" placeholder="50" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Source & Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="source"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Origem *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="website">Website</SelectItem>
                                                <SelectItem value="referral">Indicação</SelectItem>
                                                <SelectItem value="social_media">Redes Sociais</SelectItem>
                                                <SelectItem value="event">Evento</SelectItem>
                                                <SelectItem value="cold_call">Cold Call</SelectItem>
                                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                                <SelectItem value="other">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prioridade *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Baixa</SelectItem>
                                                <SelectItem value="medium">Média</SelectItem>
                                                <SelectItem value="high">Alta</SelectItem>
                                                <SelectItem value="very_high">Muito Alta</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Expected Close Date */}
                        <FormField
                            control={form.control}
                            name="expected_close_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data Prevista de Fechamento</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Criando...' : 'Criar Lead'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
