import type { PaginatedResponse } from '@/types/common';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  HEARING = 'hearing',
  MEETING = 'meeting',
  OTHER = 'other',
}

export interface Appointment {
  id: string;
  tenantId: string;
  title: string;
  start_time: Date;
  end_time: Date;
  status: AppointmentStatus;
  type: AppointmentType;

  // Relations
  clientId?: string;
  client?: {
    id: string;
    name: string;
    email?: string;
  };

  lawyerId?: string;
  lawyer?: {
    id: string;
    name: string;
  };

  meeting_link?: string;
  meet_link?: string;
  location?: string;
  notes?: string;

  created_at: Date;
  updated_at: Date;
}

export interface CreateAppointmentDTO {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  clientId?: string;
  lawyerId?: string;
  type: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
  location?: string;
  meet_link?: string;
  is_online?: boolean;
}

export type CreateAppointmentData = CreateAppointmentDTO;
export type UpdateAppointmentData = Partial<CreateAppointmentDTO>;

export interface AppointmentFilters {
  startDate?: Date;
  endDate?: Date;
  status?: AppointmentStatus;
  lawyerId?: string;
  clientId?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export type PaginatedAppointments = PaginatedResponse<Appointment>;
