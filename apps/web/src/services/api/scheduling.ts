import axios from 'axios';
import { apiClient, handleApiError } from './client';
import type {
    Appointment,
    AppointmentFilters,
    CreateAppointmentData,
    UpdateAppointmentData,
    TimeSlot,
    PaginatedResponse
} from '@/types/scheduling';

export const schedulingApi = {
    /**
     * Lista agendamentos com filtros
     */
    async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
        try {
            const { data } = await apiClient.get<Appointment[]>('/scheduling/appointments', {
                params: filters,
            });
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Busca agendamento por ID
     */
    async getAppointment(appointmentId: string): Promise<Appointment> {
        try {
            const { data } = await apiClient.get<Appointment>(
                `/scheduling/appointments/${appointmentId}`
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Cria novo agendamento
     */
    async createAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
        try {
            const { data } = await apiClient.post<Appointment>(
                '/scheduling/appointments',
                appointmentData
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Atualiza agendamento
     */
    async updateAppointment(
        appointmentId: string,
        updates: UpdateAppointmentData
    ): Promise<Appointment> {
        try {
            const { data } = await apiClient.patch<Appointment>(
                `/scheduling/appointments/${appointmentId}`,
                updates
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Cancela agendamento
     */
    async cancelAppointment(appointmentId: string, reason?: string): Promise<Appointment> {
        try {
            const { data } = await apiClient.post<Appointment>(
                `/scheduling/appointments/${appointmentId}/cancel`,
                { reason }
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Confirma agendamento
     */
    async confirmAppointment(appointmentId: string): Promise<Appointment> {
        try {
            const { data } = await apiClient.post<Appointment>(
                `/scheduling/appointments/${appointmentId}/confirm`
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Busca horários disponíveis
     */
    async getAvailableSlots(date: Date, lawyerId?: string): Promise<TimeSlot[]> {
        try {
            const { data } = await apiClient.get<TimeSlot[]>('/scheduling/available-slots', {
                params: {
                    date: date.toISOString(),
                    lawyer_id: lawyerId,
                },
            });
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Cria link do Google Meet
     */
    async createMeetLink(appointmentId: string): Promise<{ meet_link: string }> {
        try {
            const { data } = await apiClient.post<{ meet_link: string }>(
                `/scheduling/appointments/${appointmentId}/create-meet`
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Sincroniza com Google Calendar
     */
    async syncWithGoogleCalendar(appointmentId: string): Promise<{ event_id: string }> {
        try {
            const { data } = await apiClient.post<{ event_id: string }>(
                `/scheduling/appointments/${appointmentId}/sync-calendar`
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },
};
