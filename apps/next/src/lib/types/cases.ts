export enum CaseStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    CLOSED = 'closed',
    ARCHIVED = 'archived',
}

export enum CasePriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent',
}

export interface Case {
    id: string;
    tenantId: string;
    title: string;
    description?: string;
    case_number?: string;
    status: CaseStatus;
    is_urgent?: boolean;

    // Relations
    clientId: string;
    client: { // Simplified client for list view
        id: string;
        name: string;
    };
    responsibleLawyerId?: string;
    responsible_lawyer?: {
        id: string;
        name: string;
    };

    // Metadata
    practice_area?: string;
    tags?: string[];

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface CreateCaseDTO {
    title: string;
    clientId: string;
    description?: string;
    case_number?: string;
    status?: CaseStatus;
    is_urgent?: boolean;
    practice_area?: string;
    tags?: string[];
    responsibleLawyerId?: string;
}
