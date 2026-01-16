import { api } from './axios';
import type {
    LeadDto,
    LeadDetailsDto,
    LeadFunnel,
    LeadMetrics,
    LeadFilters,
    PagedLeadsResponse
} from '@/lib/types/leads';

export const leadsApi = {
    // List leads with filters and pagination
    getLeads: async (filters: LeadFilters = {}, page = 1, pageSize = 20): Promise<PagedLeadsResponse> => {
        const params = new URLSearchParams();
        if (filters.quality) params.append('quality', filters.quality);
        if (filters.caseType) params.append('caseType', filters.caseType);
        if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
        if (filters.status) params.append('status', filters.status);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.search) params.append('search', filters.search);
        params.append('page', page.toString());
        params.append('pageSize', pageSize.toString());

        const response = await api.get<PagedLeadsResponse>(`/api/leads?${params.toString()}`);
        return response.data;
    },

    // Get lead details
    getLeadDetails: async (leadId: string): Promise<LeadDetailsDto> => {
        const response = await api.get<LeadDetailsDto>(`/api/leads/${leadId}`);
        return response.data;
    },

    // Get conversion funnel
    getFunnel: async (startDate?: string, endDate?: string): Promise<LeadFunnel> => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await api.get<LeadFunnel>(`/api/leads/funnel?${params.toString()}`);
        return response.data;
    },

    // Get metrics
    getMetrics: async (advogadoId?: string): Promise<LeadMetrics> => {
        const params = advogadoId ? `?advogadoId=${advogadoId}` : '';
        const response = await api.get<LeadMetrics>(`/api/leads/metrics${params}`);
        return response.data;
    },

    // Assign lead to lawyer
    assignLead: async (leadId: string, advogadoId?: string): Promise<void> => {
        await api.post(`/api/leads/${leadId}/assign`, { advogadoId });
    },

    // Update lead status
    updateStatus: async (leadId: string, status: string): Promise<void> => {
        await api.patch(`/api/leads/${leadId}/status`, { status });
    },

    // Convert lead to client
    convertToClient: async (leadId: string): Promise<void> => {
        await api.post(`/api/leads/${leadId}/convert`);
    },

    // Mark lead as lost
    markAsLost: async (leadId: string, reason: string): Promise<void> => {
        await api.post(`/api/leads/${leadId}/lost`, { reason });
    },

    // Create follow-up task
    createFollowUp: async (leadId: string, dueDate: string, description: string): Promise<void> => {
        await api.post(`/api/leads/${leadId}/followup`, { dueDate, description });
    },
};
