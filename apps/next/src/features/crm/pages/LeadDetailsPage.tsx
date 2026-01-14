import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation'; // Changed to next/navigation
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    Edit,
    Trash2,
    TrendingUp,
    TrendingDown,
    Clock,
    Tag,
} from 'lucide-react';
import { leadsApi } from '@/services/api/leads';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { LeadActivitiesTimeline } from '../components/LeadActivitiesTimeline';

export function LeadDetailsPage() {
    const params = useParams(); // Returns generic params
    const leadId = typeof params?.leadId === 'string' ? params.leadId : ''; // Safe extraction
    const router = useRouter(); // Changed from useNavigate
    const queryClient = useQueryClient();

    const { data: lead, isLoading } = useQuery({
        queryKey: ['lead', leadId],
        queryFn: () => leadsApi.getLead(leadId),
        enabled: !!leadId,
    });

    const { data: activities } = useQuery({
        queryKey: ['lead-activities', leadId],
        queryFn: () => leadsApi.getLeadActivities(leadId),
        enabled: !!leadId,
    });

    // Mark as won mutation
    const markAsWonMutation = useMutation({
        mutationFn: (actualValue: number) => leadsApi.markAsWon(leadId, actualValue),
        onSuccess: () => {
            toast.success('Lead marcado como ganho!');
            queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
        onError: () => {
            toast.error('Erro ao marcar lead como ganho');
        },
    });

    // Mark as lost mutation
    const markAsLostMutation = useMutation({
        mutationFn: (reason: string) => leadsApi.markAsLost(leadId, reason),
        onSuccess: () => {
            toast.success('Lead marcado como perdido');
            queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
        onError: () => {
            toast.error('Erro ao marcar lead como perdido');
        },
    });

    // Ensure lead is present before rendering null checks logic below
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!lead) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <p className="text-destructive">Lead não encontrado</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{lead.title}</h1>
                    <p className="text-muted-foreground">
                        Criado em {formatDate(lead.created_at)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => {
                            const value = prompt('Valor final do negócio (R$):');
                            if (value) {
                                markAsWonMutation.mutate(parseFloat(value));
                            }
                        }}
                    >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Marcar como Ganho
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => {
                            const reason = prompt('Motivo da perda:');
                            if (reason) {
                                markAsLostMutation.mutate(reason);
                            }
                        }}
                    >
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Marcar como Perdido
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/crm/leads/${leadId}/edit`)}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                </div>
            </div>

            {/* Main Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Value Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Valor Estimado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-green-600">
                                {formatCurrency(lead.estimated_value)}
                            </span>
                            <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                {/* Probability Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Probabilidade
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{lead.probability}%</span>
                            <div className="relative h-12 w-12">
                                <svg className="transform -rotate-90" viewBox="0 0 36 36">
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="16"
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="3"
                                    />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="16"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="3"
                                        strokeDasharray={`${lead.probability} ${100 - lead.probability}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stage Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Estágio Atual
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge
                            className="text-base px-3 py-1"
                            style={{ backgroundColor: lead.stage.color }}
                        >
                            {lead.stage.name}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Lead</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Contact */}
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                                <p className="text-base font-semibold">{lead.contact.name}</p>
                                <p className="text-sm text-muted-foreground">{lead.contact.phone}</p>
                                {lead.contact.email && (
                                    <p className="text-sm text-muted-foreground">{lead.contact.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Assigned To */}
                        {lead.assigned_to_user && (
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Responsável</p>
                                    <p className="text-base font-semibold">{lead.assigned_to_user.name}</p>
                                    <p className="text-sm text-muted-foreground">{lead.assigned_to_user.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Expected Close Date */}
                        {lead.expected_close_date && (
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Previsão de Fechamento
                                    </p>
                                    <p className="text-base">{formatDate(lead.expected_close_date)}</p>
                                </div>
                            </div>
                        )}

                        {/* Last Contact */}
                        {lead.last_contact_date && (
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Último Contato
                                    </p>
                                    <p className="text-base">{formatDate(lead.last_contact_date)}</p>
                                </div>
                            </div>
                        )}

                        {/* Source */}
                        <div className="flex items-start gap-3">
                            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Origem</p>
                                <p className="text-base capitalize">{lead.source.replace('_', ' ')}</p>
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Prioridade</p>
                                <Badge variant="secondary" className="mt-1">
                                    {lead.priority.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {lead.description && (
                        <div className="pt-4 border-t">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Descrição</p>
                            <p className="text-sm whitespace-pre-wrap">{lead.description}</p>
                        </div>
                    )}

                    {/* Tags */}
                    {lead.tags.length > 0 && (
                        <div className="pt-4 border-t">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {lead.tags.map((tag) => (
                                    <Badge key={tag} variant="outline">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tabs: Activities & Notes */}
            <Tabs defaultValue="activities" className="w-full">
                <TabsList>
                    <TabsTrigger value="activities">Atividades</TabsTrigger>
                    <TabsTrigger value="notes">Notas</TabsTrigger>
                </TabsList>

                <TabsContent value="activities" className="mt-6">
                    <LeadActivitiesTimeline leadId={leadId!} activities={activities || []} />
                </TabsContent>

                <TabsContent value="notes" className="mt-6">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground text-center">
                                Sistema de notas será implementado
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
