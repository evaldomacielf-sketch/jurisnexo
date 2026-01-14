export class Case {
    id: string;
    tenant_id: string;
    title: string;
    description?: string;
    status: 'active' | 'pending' | 'closed' | 'archived';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    case_number?: string;
    practice_area?: string;
    client_id?: string;
    responsible_lawyer_id?: string;
    is_urgent: boolean;
    value?: number;
    court?: string;
    judge?: string;

    // Timestamps
    created_at: Date;
    updated_at: Date;

    // Relations
    client?: any;
    responsible_lawyer?: any;
}
