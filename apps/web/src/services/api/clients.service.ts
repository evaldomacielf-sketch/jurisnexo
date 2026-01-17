import { api } from '@/lib/axios';

export interface ContactDto {
    id: string;
    tenantId: string;
    name: string;
    phone: string;
    email?: string;
    cpf?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    source: string;
    tags: string[];
    notes?: string;
    isLead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContactRequest {
    name: string;
    phone: string;
    email?: string;
    cpf?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    source: string;
    tags?: string[];
    notes?: string;
    isLead: boolean;
}

export interface UpdateContactRequest {
    name?: string;
    phone?: string;
    email?: string;
    cpf?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    source?: string;
    tags?: string[];
    notes?: string;
    isLead?: boolean;
}

export interface ClientsFilterParams {
    search?: string;
    source?: string;
    page?: number;
    limit?: number;
}

class ClientsApiService {
    async getAll(params?: ClientsFilterParams) {
        const response = await api.get('/crm/contacts', { params: { ...params, isLead: false } }); // Filter explicitly for clients (not leads) if desired, or just all.
        // The controller filters by isLead if provided. If we want "Clients" page to show only proper clients, we might want isLead=false?
        // Or maybe show everything? Let's check user intent. "Clientes e Leads" says the subtitle. 
        // "Gerencie seus clientes e leads". So we should probably show BOTH or toggle.
        // For now, let's NOT filter by isLead by default unless specified.
        return response.data;
    }

    async getById(id: string) {
        const response = await api.get(`/crm/contacts/${id}`);
        return response.data;
    }

    async create(data: CreateContactRequest) {
        const response = await api.post('/crm/contacts', data);
        return response.data;
    }

    async update(id: string, data: UpdateContactRequest) {
        const response = await api.patch(`/crm/contacts/${id}`, data);
        return response.data;
    }

    async delete(id: string) {
        await api.delete(`/crm/contacts/${id}`);
    }
}

export const clientsApi = new ClientsApiService();
