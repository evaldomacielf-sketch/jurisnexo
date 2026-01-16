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
  type: 'INCOME' | 'EXPENSE' | 'BOTH';
  icon?: string;
  description?: string;
}

export interface CreateCategoryDTO {
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'BOTH';
  color?: string;
  icon?: string;
  description?: string;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

// Bank Account
export enum BankAccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
}

export interface BankAccount {
  id: string;
  tenant_id: string;
  name: string;
  type: BankAccountType;
  balance: number;
  currency: string;
  institution?: string;
  account_number?: string;
  agency?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBankAccountDTO {
  name: string;
  type: BankAccountType;
  initial_balance?: number;
  currency?: string;
  institution?: string;
  account_number?: string;
  agency?: string;
  color?: string;
}

export interface UpdateBankAccountDTO extends Partial<CreateBankAccountDTO> {
  is_active?: boolean;
}

// Recurring Transaction
export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export interface RecurringTransaction {
  id: string;
  tenant_id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  frequency: RecurrenceFrequency;
  start_date: string;
  end_date?: string;
  day_of_month?: number;
  category_id: string;
  category?: FinanceCategory;
  account_id: string;
  account?: BankAccount;
  payment_method: PaymentMethod;
  is_active: boolean;
  last_generated_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringTransactionDTO {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  frequency: RecurrenceFrequency;
  start_date: string;
  end_date?: string;
  day_of_month?: number;
  category_id: string;
  account_id: string;
  payment_method: PaymentMethod;
}

export interface UpdateRecurringTransactionDTO extends Partial<CreateRecurringTransactionDTO> {
  is_active?: boolean;
}

// Budget Planning
export interface Budget {
  id: string;
  tenant_id: string;
  category_id: string;
  category?: FinanceCategory;
  year: number;
  month: number;
  planned_amount: number;
  actual_amount?: number; // Calculated field
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetDTO {
  category_id: string;
  year: number;
  month: number;
  planned_amount: number;
  notes?: string;
}

export interface UpdateBudgetDTO {
  planned_amount?: number;
  notes?: string;
}

export interface BudgetSummary {
  total_planned: number;
  total_actual: number;
  categories: Array<Budget & { category_name: string; category_color: string }>;
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
