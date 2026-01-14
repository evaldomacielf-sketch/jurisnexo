'use client';

import type { Client, CreateClientDTO, CreateInteractionDTO, CreateDocumentDTO } from '@/lib/types/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// ============================================
// 👥 Clients API
// ============================================

export const clientsApi = {
    // CRUD
    async getAll(filters?: any): Promise<Client[]> {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_URL}/clients?${params}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Erro ao buscar clientes');
        return response.json();
    },

    async getById(id: string): Promise<Client> {
        const response = await fetch(`${API_URL}/clients/${id}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Erro ao buscar cliente');
        return response.json();
    },

    async create(data: CreateClientDTO): Promise<Client> {
        const response = await fetch(`${API_URL}/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Erro ao criar cliente');
        return response.json();
    },

    async update(id: string, data: Partial<CreateClientDTO>): Promise<Client> {
        const response = await fetch(`${API_URL}/clients/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Erro ao atualizar cliente');
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/clients/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Erro ao deletar cliente');
    },

    // Interações
    async createInteraction(data: CreateInteractionDTO) {
        const response = await fetch(`${API_URL}/clients/interactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Erro ao criar interação');
        return response.json();
    },

    async getInteractions(clientId: string) {
        const response = await fetch(`${API_URL}/clients/${clientId}/interactions`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Erro ao buscar interações');
        return response.json();
    },

    // Documentos
    async uploadDocument(data: CreateDocumentDTO) {
        const response = await fetch(`${API_URL}/clients/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Erro ao fazer upload');
        return response.json();
    },

    async getDocuments(clientId: string) {
        const response = await fetch(`${API_URL}/clients/${clientId}/documents`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Erro ao buscar documentos');
        return response.json();
    },

    async deleteDocument(id: string) {
        const response = await fetch(`${API_URL}/clients/documents/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Erro ao deletar documento');
    },
};
