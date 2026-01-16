import api from '@/lib/api';

// Types
export enum EventType {
    AUDIENCIA = 'audiencia',
    REUNIAO = 'reuniao',
    PRAZO = 'prazo',
    CONSULTA = 'consulta',
    DEPOIMENTO = 'depoimento',
    PERICIA = 'pericia',
    MEDIACAO = 'mediacao',
    OUTRO = 'outro',
}

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    type: EventType;
    startDate: string;
    endDate: string;
    allDay: boolean;
    location?: string;
    videoLink?: string;
    caseId?: string;
    clientId?: string;
    participantIds: string[];
    reminders: Reminder[];
    recurrence?: Recurrence;
    color?: string;
    googleEventId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Reminder {
    type: 'email' | 'notification' | 'sms' | 'whatsapp';
    minutesBefore: number;
}

export interface Recurrence {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    endDate?: string;
    count?: number;
}

export interface CreateEventDto {
    title: string;
    description?: string;
    type: EventType;
    startDate: string;
    endDate: string;
    allDay?: boolean;
    location?: string;
    videoLink?: string;
    caseId?: string;
    clientId?: string;
    participantIds?: string[];
    reminders?: Reminder[];
    recurrence?: Recurrence;
    color?: string;
    syncWithGoogle?: boolean;
}

// API
export const calendarApi = {
    getEvents: async (startDate: string, endDate: string, options?: { type?: EventType; caseId?: string }) => {
        const params: any = { startDate, endDate, ...options };
        const response = await api.get('/calendar/events', { params });
        return response.data as CalendarEvent[];
    },

    getUpcoming: async (limit = 5) => {
        const response = await api.get('/calendar/events/upcoming', { params: { limit } });
        return response.data as CalendarEvent[];
    },

    getById: async (id: string) => {
        const response = await api.get(`/calendar/events/${id}`);
        return response.data as CalendarEvent;
    },

    create: async (data: CreateEventDto) => {
        const response = await api.post('/calendar/events', data);
        return response.data as CalendarEvent;
    },

    update: async (id: string, data: Partial<CreateEventDto>) => {
        const response = await api.put(`/calendar/events/${id}`, data);
        return response.data as CalendarEvent;
    },

    delete: async (id: string) => {
        await api.delete(`/calendar/events/${id}`);
    },

    getStats: async (startDate: string, endDate: string) => {
        const response = await api.get('/calendar/events/stats', { params: { startDate, endDate } });
        return response.data as Record<EventType, number>;
    },

    // Google Calendar
    getGoogleAuthUrl: async () => {
        const response = await api.get('/calendar/google/auth');
        return response.data.authUrl as string;
    },

    getGoogleStatus: async () => {
        const response = await api.get('/calendar/google/status');
        return response.data.connected as boolean;
    },

    disconnectGoogle: async () => {
        await api.delete('/calendar/google/disconnect');
    },

    syncGoogle: async (startDate: string, endDate: string) => {
        const response = await api.post('/calendar/google/sync', { startDate, endDate });
        return response.data;
    },
};

export default calendarApi;
