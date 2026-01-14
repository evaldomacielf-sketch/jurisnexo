import { getSession } from '../auth/session';
import type { Appointment, CreateAppointmentDTO } from '../types/scheduling';

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

export const schedulingApi = {
    getAppointments: async (params?: { startDate?: Date; endDate?: Date }) => {
        const headers = await getHeaders();
        let url = `${API_URL}/schedule`;

        if (params?.startDate && params?.endDate) {
            const searchParams = new URLSearchParams();
            searchParams.append('start', params.startDate.toISOString());
            searchParams.append('end', params.endDate.toISOString());
            url += `?${searchParams.toString()}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch appointments');
        }

        return response.json() as Promise<Appointment[]>;
    },

    getAppointmentById: async (id: string) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/schedule/${id}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch appointment');
        }

        return response.json() as Promise<Appointment>;
    },

    createAppointment: async (data: CreateAppointmentDTO) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/schedule`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to create appointment');
        }

        return response.json() as Promise<Appointment>;
    },

    updateAppointment: async (id: string, data: Partial<CreateAppointmentDTO>) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/schedule/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update appointment');
        }

        return response.json() as Promise<Appointment>;
    },

    deleteAppointment: async (id: string) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/schedule/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to delete appointment');
        }
    },
};
