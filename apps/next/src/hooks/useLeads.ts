import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/services/api/leads.service';
import type { LeadFilters, LeadFunnel, LeadMetrics, PagedLeadsResponse } from '@/lib/types/leads';

export function useLeads(filters: LeadFilters = {}, page = 1, pageSize = 20) {
    return useQuery<PagedLeadsResponse>({
        queryKey: ['leads', filters, page, pageSize],
        queryFn: () => leadsApi.getLeads(filters, page, pageSize),
    });
}

export function useLeadDetails(leadId: string | null) {
    return useQuery({
        queryKey: ['lead', leadId],
        queryFn: () => leadsApi.getLeadDetails(leadId!),
        enabled: !!leadId,
    });
}

export function useLeadFunnel(startDate?: string, endDate?: string) {
    return useQuery<LeadFunnel>({
        queryKey: ['leadFunnel', startDate, endDate],
        queryFn: () => leadsApi.getFunnel(startDate, endDate),
    });
}

export function useLeadMetrics(advogadoId?: string) {
    return useQuery<LeadMetrics>({
        queryKey: ['leadMetrics', advogadoId],
        queryFn: () => leadsApi.getMetrics(advogadoId),
    });
}

export function useAssignLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ leadId, advogadoId }: { leadId: string; advogadoId?: string }) =>
            leadsApi.assignLead(leadId, advogadoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
}

export function useUpdateLeadStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ leadId, status }: { leadId: string; status: string }) =>
            leadsApi.updateStatus(leadId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
}

export function useConvertLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (leadId: string) => leadsApi.convertToClient(leadId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['leadFunnel'] });
        },
    });
}

export function useMarkLeadAsLost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ leadId, reason }: { leadId: string; reason: string }) =>
            leadsApi.markAsLost(leadId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['leadFunnel'] });
        },
    });
}
