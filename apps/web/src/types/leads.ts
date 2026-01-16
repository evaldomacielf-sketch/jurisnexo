export interface Lead {
    id: string;
    tenant_id: string;
    title: string;
    description?: string;
    contact_id: string;
    contact: ContactInfo;
    pipeline_id: string;
    pipeline_name: string;
    stage_id: string;
    stage: StageInfo;
    estimated_value: number;
    currency: string;
    probability: number;
    source: LeadSource;
    priority: LeadPriority;
    status: LeadStatus;
    assigned_to_user_id?: string;
    assigned_to_user?: UserInfo;
    expected_close_date?: string;
    actual_close_date?: string;
    last_contact_date?: string;
    next_follow_up_date?: string;
    tags: string[];
    position: number;
    created_at: string;
    updated_at: string;
}

export type LeadSource = 'Website' | 'Referral' | 'SocialMedia' | 'Event' | 'ColdCall' | 'Whatsapp' | 'Other';
export type LeadPriority = 'Low' | 'Medium' | 'High' | 'VeryHigh';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost' | 'Archived';

export interface ContactInfo {
    id: string;
    name: string;
    phone: string;
    email?: string;
}

export interface StageInfo {
    id: string;
    name: string;
    color: string;
    position: number;
}

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
}

export interface LeadFilters {
    pipeline_id?: string;
    stage_id?: string;
    status?: LeadStatus;
    priority?: LeadPriority;
    assigned_to?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export type CreateLeadData = Omit<Lead, 'id' | 'tenant_id' | 'contact' | 'pipeline_name' | 'stage' | 'assigned_to_user' | 'position' | 'created_at' | 'updated_at'>;
export type UpdateLeadData = Partial<Pick<Lead, 'title' | 'description' | 'estimated_value' | 'probability' | 'priority' | 'assigned_to_user_id' | 'expected_close_date' | 'next_follow_up_date' | 'tags'>>;

export interface MoveLeadData {
    source_stage_id: string;
    target_stage_id: string;
    position: number;
}

export interface LeadActivity {
    id: string;
    type: ActivityType;
    title: string;
    description?: string;
    created_by: UserInfo;
    activity_date: string;
    duration_minutes?: number;
    created_at: string;
}

export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Task' | 'Note' | 'StatusChange' | 'StageChange' | 'ValueChange' | 'AssignmentChange';

export type CreateLeadActivityData = Omit<LeadActivity, 'id' | 'created_by' | 'created_at'>;

export interface Pipeline {
    id: string;
    tenant_id: string;
    name: string;
    description?: string;
    color: string;
    is_active: boolean;
    is_default: boolean;
    stages: Stage[];
    position: number;
    created_at: string;
    updated_at: string;
}

export interface Stage {
    id: string;
    name: string;
    description?: string;
    color: string;
    default_probability: number;
    position: number;
    is_initial_stage: boolean;
    is_won_stage: boolean;
    is_lost_stage: boolean;
    lead_count: number;
    total_value: number;
}

export type CreatePipelineData = Omit<Pipeline, 'id' | 'tenant_id' | 'stages' | 'position' | 'created_at' | 'updated_at'> & {
    stages: CreateStageData[];
};

export type CreateStageData = Omit<Stage, 'id' | 'lead_count' | 'total_value'>;

export interface PipelineMetrics {
    pipeline_id: string;
    pipeline_name: string;
    total_leads: number;
    total_value: number;
    won_leads: number;
    won_value: number;
    lost_leads: number;
    lost_value: number;
    conversion_rate: number;
    average_deal_size: number;
    average_days_to_close: number;
    stage_metrics: StageMetrics[];
}

export interface StageMetrics {
    stage_id: string;
    stage_name: string;
    lead_count: number;
    total_value: number;
    conversion_to_next_stage: number;
    average_days_in_stage: number;
}

// Ensure PaginatedResponse is imported or defined if used in services
export interface PaginatedResponse<T> {
    items: T[];
    metadata: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasPrevious: boolean;
        hasNext: boolean;
    };
}
