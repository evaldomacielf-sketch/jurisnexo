import { apiClient } from '@/services/api/client';
import type { Client, CreateClientDTO, ClientInteraction, ClientDocument } from '../types/client';

export const clientsApi = {
    getClients: async (params?: { search?: string; status?: string; type?: string }) => {
        const { data } = await apiClient.get<Client[]>('/clients', { params });
        return data;
    },

    getClientById: async (id: string) => {
        const { data } = await apiClient.get<Client>(`/clients/${id}`);
        return data;
    },

    createClient: async (client: CreateClientDTO) => {
        const { data } = await apiClient.post<Client>('/clients', client);
        return data;
    },

    updateClient: async (id: string, client: Partial<CreateClientDTO>) => {
        const { data } = await apiClient.patch<Client>(`/clients/${id}`, client);
        return data;
    },

    deleteClient: async (id: string) => {
        await apiClient.delete(`/clients/${id}`);
    },

    addInteraction: async (clientId: string, interaction: Omit<ClientInteraction, 'id' | 'createdAt'>) => {
        const { data } = await apiClient.post<ClientInteraction>(`/clients/${clientId}/interactions`, interaction);
        return data;
    },

    addDocument: async (clientId: string, document: Omit<ClientDocument, 'id' | 'uploadedAt'>) => {
        const { data } = await apiClient.post<ClientDocument>(`/clients/${clientId}/documents`, document);
        return data;
    },

    deleteDocument: async (clientId: string, documentId: string) => {
        await apiClient.delete(`/clients/${clientId}/documents/${documentId}`);
    }
};
