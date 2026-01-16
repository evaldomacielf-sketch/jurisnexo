import { apiClient } from '@/services/api/client';
import type { Appointment, CreateAppointmentDTO } from '../types/scheduling';

export const schedulingApi = {
  getAppointments: async (params?: { startDate?: Date; endDate?: Date }) => {
    const queryParams: any = {};
    if (params?.startDate) queryParams.start = params.startDate.toISOString();
    if (params?.endDate) queryParams.end = params.endDate.toISOString();

    const { data } = await apiClient.get<Appointment[]>('/schedule', { params: queryParams });
    return data;
  },

  getAppointmentById: async (id: string) => {
    const { data } = await apiClient.get<Appointment>(`/schedule/${id}`);
    return data;
  },

  createAppointment: async (data: CreateAppointmentDTO) => {
    const { data: response } = await apiClient.post<Appointment>('/schedule', data);
    return response;
  },

  updateAppointment: async (id: string, data: Partial<CreateAppointmentDTO>) => {
    const { data: response } = await apiClient.patch<Appointment>(`/schedule/${id}`, data);
    return response;
  },

  deleteAppointment: async (id: string) => {
    await apiClient.delete(`/schedule/${id}`);
  },
};
