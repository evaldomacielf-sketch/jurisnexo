import axios from 'axios';
import { apiClient, handleApiError } from './client';
import type {
    Case,
    CaseFilters,
    CreateCaseData,
    UpdateCaseData,
    CaseEvent,
    CreateCaseEventData,
    PaginatedResponse
} from '@/types/cases';

export const casesApi = {
    /**
     * Lista processos com filtros
     */
    async getCases(filters?: CaseFilters): Promise<PaginatedResponse<Case>> {
        try {
            const { data } = await apiClient.get<PaginatedResponse<Case>>('/cases', {
                params: filters,
            });
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Busca processo por ID
     */
    async getCase(caseId: string): Promise<Case> {
        try {
            const { data } = await apiClient.get<Case>(`/cases/${caseId}`);
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Cria novo processo
     */
    async createCase(caseData: CreateCaseData): Promise<Case> {
        try {
            const { data } = await apiClient.post<Case>('/cases', caseData);
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Atualiza processo
     */
    async updateCase(caseId: string, updates: UpdateCaseData): Promise<Case> {
        try {
            const { data } = await apiClient.patch<Case>(`/cases/${caseId}`, updates);
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Remove processo
     */
    async deleteCase(caseId: string): Promise<void> {
        try {
            await apiClient.delete(`/cases/${caseId}`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Lista eventos/timeline de um processo
     */
    async getCaseEvents(caseId: string): Promise<CaseEvent[]> {
        try {
            const { data } = await apiClient.get<CaseEvent[]>(`/cases/${caseId}/events`);
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Adiciona evento ao processo
     */
    async addCaseEvent(caseId: string, eventData: CreateCaseEventData): Promise<CaseEvent> {
        try {
            const { data } = await apiClient.post<CaseEvent>(
                `/cases/${caseId}/events`,
                eventData
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Atualiza status do processo
     */
    async updateCaseStatus(
        caseId: string,
        status: Case['status']
    ): Promise<Case> {
        try {
            const { data } = await apiClient.patch<Case>(`/cases/${caseId}/status`, { status });
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Associa cliente ao processo
     */
    async assignClient(caseId: string, clientId: string): Promise<Case> {
        try {
            const { data } = await apiClient.post<Case>(`/cases/${caseId}/assign-client`, {
                client_id: clientId,
            });
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Associa advogado responsável
     */
    async assignLawyer(caseId: string, lawyerId: string): Promise<Case> {
        try {
            const { data } = await apiClient.post<Case>(`/cases/${caseId}/assign-lawyer`, {
                lawyer_id: lawyerId,
            });
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },
};
