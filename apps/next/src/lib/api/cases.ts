import { getSession } from '../auth/session';
import type { Case, CreateCaseDTO } from '../types/cases';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getHeaders() {
    const session = await getSession();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    return headers;
}

export const casesApi = {
    getCases: async (filters?: { status?: string }) => {
        const headers = await getHeaders();
        let url = `${API_URL}/cases`;
        if (filters?.status) {
            url += `?status=${filters.status}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cases');
        }

        return response.json() as Promise<Case[]>;
    },

    getCaseById: async (id: string) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/cases/${id}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch case');
        }

        return response.json() as Promise<Case>;
    },

    createCase: async (data: CreateCaseDTO) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/cases`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to create case');
        }

        return response.json() as Promise<Case>;
    },

    updateCase: async (id: string, data: Partial<CreateCaseDTO>) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/cases/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update case');
        }

        return response.json() as Promise<Case>;
    },

    deleteCase: async (id: string) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/cases/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to delete case');
        }
    },
};
