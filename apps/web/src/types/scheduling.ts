import type { PaginatedResponse } from './common';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
export type AppointmentType = 'consultation' | 'hearing' | 'meeting' | 'other';

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
  location?: string;
  notes?: string;

  created_at: Date;
  updated_at: Date;
}

export interface CreateAppointmentDTO {
  title: string;
  start_time: Date;
  end_time: Date;
  clientId: string;
  lawyerId?: string;
  type: AppointmentType;
  notes?: string;
  location?: string;
}

// Aliases for compatibility with new service
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
