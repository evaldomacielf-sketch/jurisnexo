/**
 * Finance Module Types
 * Tipos para o módulo financeiro do JurisNexo
 */

// Enums
export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    PARTIAL = 'PARTIAL',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
    PIX = 'PIX',
    BOLETO = 'BOLETO',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    TRANSFER = 'TRANSFER',
    CASH = 'CASH',
    OTHER = 'OTHER',
}

export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

// Category
export interface FinanceCategory {
    id: string;
    name: string;
    color: string;
}

// Receivable (Conta a Receber)
export interface Receivable {
    id: string;
    tenant_id: string;
    client_id?: string;
    client_name?: string;
    client_document?: string;
    case_id?: string;
    description: string;
    amount: number;
    paid_amount: number;
    due_date: string;
    payment_date?: string;
    status: PaymentStatus;
    payment_method?: PaymentMethod;
    category_id?: string;
    category?: FinanceCategory;
    recurrence_type?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateReceivableDTO {
    client_id?: string;
    client_name?: string;
    client_document?: string;
    case_id?: string;
    description: string;
    amount: number;
    due_date: string;
    payment_method?: PaymentMethod;
    category_id?: string;
    recurrence_type?: string;
    notes?: string;
}

export interface RecordPaymentDTO {
    amount: number;
    payment_date?: string;
    payment_method?: PaymentMethod;
    notes?: string;
}

// Payable (Conta a Pagar)
export interface Payable {
    id: string;
    tenant_id: string;
    supplier_name: string;
    supplier_document?: string;
    description: string;
    amount: number;
    paid_amount: number;
    due_date: string;
    payment_date?: string;
    status: PaymentStatus;
    approval_status: ApprovalStatus;
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
    payment_method?: PaymentMethod;
    category_id?: string;
    category?: FinanceCategory;
    account_id?: string;
    attachments?: any[];
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePayableDTO {
    supplier_name: string;
    supplier_document?: string;
    description: string;
    amount: number;
    due_date: string;
    payment_method?: PaymentMethod;
    category_id?: string;
    account_id?: string;
    notes?: string;
}

export interface ApprovePayableDTO {
    status: ApprovalStatus.APPROVED | ApprovalStatus.REJECTED;
    rejection_reason?: string;
}

// Query params
export interface FinanceQuery {
    status?: PaymentStatus;
    due_date_from?: string;
    due_date_to?: string;
    client_id?: string;
    category_id?: string;
    approval_status?: ApprovalStatus;
    page?: number;
    limit?: number;
}

// Pagination
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Dashboard KPIs
export interface DashboardKPIs {
    total_receivables: number;
    total_received: number;
    total_overdue: number;
    total_payables: number;
    total_paid: number;
    cash_flow_balance: number;
    overdue_count: number;
    pending_approval_count: number;
}

// Cash Flow Projection
export interface CashFlowProjection {
    period: {
        start: string;
        end: string;
    };
    projection: Array<{
        date: string;
        inflows: number;
        outflows: number;
        balance: number;
    }>;
    summary: {
        total_inflows: number;
        total_outflows: number;
        projected_balance: number;
    };
}

// Aging Report
export interface AgingReport {
    type: 'receivables' | 'payables';
    buckets: {
        current: number;
        '1-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
    total: number;
}

// Monthly Summary
export interface MonthlySummary {
    period: {
        year: number;
        month: number;
    };
    revenue: number;
    expenses: number;
    profit: number;
    margin: string | number;
}
