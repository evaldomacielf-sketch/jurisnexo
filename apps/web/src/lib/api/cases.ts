import { apiClient } from '@/services/api/client';
import type { Case, CreateCaseDTO } from '../types/cases';

export const casesApi = {
  getCases: async (params?: { search?: string; status?: string }) => {
    const { data } = await apiClient.get<Case[]>('/cases', { params });
    return data;
  },

  getCaseById: async (id: string) => {
    const { data } = await apiClient.get<Case>(`/cases/${id}`);
    return data;
  },

  createCase: async (data: CreateCaseDTO) => {
    const { response } = await apiClient.post<Case>('/cases', data);
    return response;
  },

  // Method expected by CaseDetails component
  getCase: async (id: string) => {
    const { data } = await apiClient.get<Case>(`/cases/${id}`);
    return data;
  },

  // Method expected by CaseDetails component
  deleteCase: async (id: string) => {
    await apiClient.delete(`/cases/${id}`);
  },

  updateCase: async (id: string, data: Partial<CreateCaseDTO>) => {
    const { data: response } = await apiClient.patch<Case>(`/cases/${id}`, data);
    return response;
  },
};
