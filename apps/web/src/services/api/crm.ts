import axios from 'axios';
import { apiClient, handleApiError } from './client';
import type {
  Contact,
  ContactFilters,
  CreateContactData,
  UpdateContactData,
  Interaction,
  CreateInteractionData,
  Document as ContactDocument,
  PaginatedResponse,
} from '@/types/crm';

export const crmApi = {
  /**
   * Lista contatos com filtros e paginação
   */
  async getContacts(filters?: ContactFilters): Promise<PaginatedResponse<Contact>> {
    try {
      const { data } = await apiClient.get<PaginatedResponse<Contact>>('/crm/contacts', {
        params: filters,
      });
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Busca contato por ID
   */
  async getContact(contactId: string): Promise<Contact> {
    try {
      const { data } = await apiClient.get<Contact>(`/crm/contacts/${contactId}`);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Cria novo contato
   */
  async createContact(contactData: CreateContactData): Promise<Contact> {
    try {
      const { data } = await apiClient.post<Contact>('/crm/contacts', contactData);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Atualiza contato existente
   */
  async updateContact(contactId: string, updates: UpdateContactData): Promise<Contact> {
    try {
      const { data } = await apiClient.patch<Contact>(`/crm/contacts/${contactId}`, updates);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Remove contato
   */
  async deleteContact(contactId: string): Promise<void> {
    try {
      await apiClient.delete(`/crm/contacts/${contactId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Busca interações de um contato
   */
  async getContactInteractions(contactId: string): Promise<Interaction[]> {
    try {
      const { data } = await apiClient.get<Interaction[]>(
        `/crm/contacts/${contactId}/interactions`
      );
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Adiciona interação a um contato
   */
  async addInteraction(
    contactId: string,
    interactionData: CreateInteractionData
  ): Promise<Interaction> {
    try {
      const { data } = await apiClient.post<Interaction>(
        `/crm/contacts/${contactId}/interactions`,
        interactionData
      );
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Lista documentos de um contato
   */
  async getContactDocuments(contactId: string): Promise<ContactDocument[]> {
    try {
      const { data } = await apiClient.get<ContactDocument[]>(
        `/crm/contacts/${contactId}/documents`
      );
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Upload de documento para contato
   */
  async uploadContactDocument(contactId: string, formData: FormData): Promise<ContactDocument> {
    try {
      const { data } = await apiClient.post<ContactDocument>(
        `/crm/contacts/${contactId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Remove documento de contato
   */
  async deleteContactDocument(contactId: string, documentId: string): Promise<void> {
    try {
      await apiClient.delete(`/crm/contacts/${contactId}/documents/${documentId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Busca contatos por telefone (para integração WhatsApp)
   */
  async findByPhone(phone: string): Promise<Contact | null> {
    try {
      const { data } = await apiClient.get<Contact>('/crm/contacts/by-phone', {
        params: { phone },
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Exporta contatos para CSV
   */
  async exportContacts(filters?: ContactFilters): Promise<Blob> {
    try {
      const { data } = await apiClient.get('/crm/contacts/export', {
        params: filters,
        responseType: 'blob',
      });
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
