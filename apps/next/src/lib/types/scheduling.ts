export enum AppointmentStatus {
    SCHEDULED = 'scheduled',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    NO_SHOW = 'no_show',
}

export enum AppointmentType {
    MEETING = 'meeting',
    HEARING = 'hearing',
    DEADLINE = 'deadline',
    GATHERING = 'gathering',
    OTHER = 'other',
}

export interface Appointment {
    id: string;
    tenantId: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    status: AppointmentStatus;
    type: AppointmentType;
    is_online?: boolean;
    meet_link?: string;
    location?: string;

    // Relations
    clientId?: string;
    client?: {
        id: string;
        name: string;
    };
    caseId?: string;
    case?: {
        id: string;
        title: string;
    };

    participants?: {
        id: string;
        name: string;
        email: string;
    }[];

    created_at: string;
    updated_at: string;
}

export interface CreateAppointmentDTO {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    status?: AppointmentStatus;
    type?: AppointmentType;
    is_online?: boolean;
    meet_link?: string;
    location?: string;
    clientId?: string;
    caseId?: string;
    participantIds?: string[];
}
