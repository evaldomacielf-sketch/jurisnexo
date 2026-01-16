import { describe, it, expect, vi, beforeEach } from 'vitest';
import { crmApi } from '../crm';
import { apiClient } from '../client';
import type { Contact } from '@/types/crm';

// Mock do apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  handleApiError: vi.fn((error) => error.message),
}));

describe('crmApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getContacts', () => {
    it('deve buscar lista de contatos', async () => {
      const mockContacts: Contact[] = [
        {
          id: '1',
          tenant_id: 'tenant-1',
          name: 'João Silva',
          phone: '11999999999',
          source: 'whatsapp',
          is_lead: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Contact,
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          data: mockContacts,
          pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
        },
      });

      const result = await crmApi.getContacts();

      expect(apiClient.get).toHaveBeenCalledWith('/crm/contacts', {
        params: undefined,
      });
      expect(result.data).toEqual(mockContacts);
    });

    it('deve passar filtros corretamente', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [], pagination: {} } });

      await crmApi.getContacts({ search: 'João', source: 'whatsapp' });

      expect(apiClient.get).toHaveBeenCalledWith('/crm/contacts', {
        params: { search: 'João', source: 'whatsapp' },
      });
    });
  });

  describe('createContact', () => {
    it('deve criar novo contato', async () => {
      const newContact = {
        name: 'Maria Santos',
        phone: '11988888888',
        email: 'maria@teste.com',
        source: 'website' as const,
        is_lead: true,
      };

      const mockResponse: Contact = {
        id: '2',
        tenant_id: 'tenant-1',
        ...newContact,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Contact;

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await crmApi.createContact(newContact);

      expect(apiClient.post).toHaveBeenCalledWith('/crm/contacts', newContact);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteContact', () => {
    it('deve deletar contato', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined });

      await crmApi.deleteContact('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/crm/contacts/1');
    });
  });

  describe('uploadContactDocument', () => {
    it('deve fazer upload de documento', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.pdf');

      const mockDoc = {
        id: 'doc-1',
        contact_id: '1',
        name: 'test.pdf',
        url: 'https://example.com/test.pdf',
        size: 1024,
        mime_type: 'application/pdf',
        uploaded_at: new Date().toISOString(),
        uploaded_by: 'user-1',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockDoc });

      const result = await crmApi.uploadContactDocument('1', formData);

      expect(apiClient.post).toHaveBeenCalledWith('/crm/contacts/1/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockDoc);
    });
  });
});
