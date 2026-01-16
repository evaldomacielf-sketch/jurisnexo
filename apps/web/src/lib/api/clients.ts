import { apiClient } from '@/services/api/client';
import type {
  Client,
  CreateClientDTO,
  ClientInteraction,
  ClientDocument,
  CreateInteractionDTO,
} from '../types/client';

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

  getInteractions: async (clientId: string) => {
    const { data } = await apiClient.get<ClientInteraction[]>(`/clients/${clientId}/interactions`);
    return data;
  },

  addInteraction: async (clientId: string, interaction: Omit<CreateInteractionDTO, 'clientId'>) => {
    const { data } = await apiClient.post<ClientInteraction>(`/clients/${clientId}/interactions`, {
      ...interaction,
      clientId,
    });
    return data;
  },

  getDocuments: async (clientId: string) => {
    const { data } = await apiClient.get<ClientDocument[]>(`/clients/${clientId}/documents`);
    return data;
  },

  addDocument: async (clientId: string, document: Omit<ClientDocument, 'id' | 'uploadedAt'>) => {
    const { data } = await apiClient.post<ClientDocument>(
      `/clients/${clientId}/documents`,
      document
    );
    return data;
  },

  uploadDocument: async (clientId: string, formData: FormData) => {
    const { data } = await apiClient.post<ClientDocument>(
      `/clients/${clientId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  deleteDocument: async (clientId: string, documentId: string) => {
    await apiClient.delete(`/clients/${clientId}/documents/${documentId}`);
  },
};
