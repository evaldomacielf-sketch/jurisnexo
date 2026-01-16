import api from '@/lib/api';

// Types
export interface Workflow {
    id: string;
    name: string;
    description?: string;
    trigger: TriggerConfig;
    steps: WorkflowStep[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastExecutedAt?: string;
    executionCount?: number;
}

export interface TriggerConfig {
    type: TriggerType;
    conditions?: Record<string, any>;
    cronExpression?: string;
}

export enum TriggerType {
    CASE_CREATED = 'case_created',
    CASE_STATUS_CHANGED = 'case_status_changed',
    CASE_DEADLINE_APPROACHING = 'case_deadline_approaching',
    CLIENT_CREATED = 'client_created',
    CLIENT_UPDATED = 'client_updated',
    PAYMENT_RECEIVED = 'payment_received',
    PAYMENT_OVERDUE = 'payment_overdue',
    INVOICE_CREATED = 'invoice_created',
    DOCUMENT_UPLOADED = 'document_uploaded',
    APPOINTMENT_CREATED = 'appointment_created',
    APPOINTMENT_REMINDER = 'appointment_reminder',
    MANUAL = 'manual',
    SCHEDULED = 'scheduled',
}

export enum ActionType {
    SEND_EMAIL = 'send_email',
    SEND_SMS = 'send_sms',
    SEND_WHATSAPP = 'send_whatsapp',
    CREATE_TASK = 'create_task',
    CREATE_EVENT = 'create_event',
    CREATE_NOTIFICATION = 'create_notification',
    CALL_WEBHOOK = 'call_webhook',
    UPDATE_RECORD = 'update_record',
    DELAY = 'delay',
    CONDITION = 'condition',
}

export interface WorkflowStep {
    order: number;
    action: {
        type: ActionType;
        config: Record<string, any>;
    };
    condition?: {
        field: string;
        operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
        value: any;
    };
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    triggerEvent: Record<string, any>;
    startedAt?: string;
    completedAt?: string;
    error?: string;
    stepResults: {
        stepOrder: number;
        status: 'success' | 'failed' | 'skipped';
        output?: any;
        error?: string;
        executedAt: string;
    }[];
}

export interface WorkflowStats {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
}

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    trigger: TriggerConfig;
    steps: WorkflowStep[];
}

// API Functions
export const workflowsApi = {
    // CRUD
    getAll: async (active?: boolean, trigger?: TriggerType): Promise<Workflow[]> => {
        const params: any = {};
        if (active !== undefined) params.active = active;
        if (trigger) params.trigger = trigger;
        const response = await api.get('/workflows', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Workflow> => {
        const response = await api.get(`/workflows/${id}`);
        return response.data;
    },

    create: async (data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> => {
        const response = await api.post('/workflows', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Workflow>): Promise<Workflow> => {
        const response = await api.put(`/workflows/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/workflows/${id}`);
    },

    // Actions
    toggle: async (id: string): Promise<Workflow> => {
        const response = await api.post(`/workflows/${id}/toggle`);
        return response.data;
    },

    duplicate: async (id: string): Promise<Workflow> => {
        const response = await api.post(`/workflows/${id}/duplicate`);
        return response.data;
    },

    execute: async (id: string, triggerData: Record<string, any>): Promise<{ executionId: string }> => {
        const response = await api.post(`/workflows/${id}/execute`, { triggerData });
        return response.data;
    },

    // Stats & History
    getStats: async (): Promise<WorkflowStats> => {
        const response = await api.get('/workflows/stats');
        return response.data;
    },

    getTemplates: async (): Promise<WorkflowTemplate[]> => {
        const response = await api.get('/workflows/templates');
        return response.data;
    },

    getExecutions: async (workflowId: string, page = 1, limit = 20) => {
        const response = await api.get(`/workflows/${workflowId}/executions`, {
            params: { page, limit },
        });
        return response.data;
    },
};

export default workflowsApi;
