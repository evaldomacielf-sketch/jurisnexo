// Enums
export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    PIX = 'PIX',
    CHECK = 'CHECK',
    OTHER = 'OTHER',
}

export enum AccountType {
    CHECKING = 'CHECKING',
    SAVINGS = 'SAVINGS',
    INVESTMENT = 'INVESTMENT',
    CREDIT_CARD = 'CREDIT_CARD',
}

export enum CategoryType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    BOTH = 'BOTH',
}

// Interfaces
export interface BankAccount {
    id: string;
    name: string;
    bank_name: string;
    agency?: string;
    account_number: string;
    account_type: AccountType;
    current_balance: number;
    is_active: boolean;
    law_office_id: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    type: CategoryType;
    description?: string;
    color: string;
    icon?: string;
    law_office_id: string;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    description: string;
    type: TransactionType;
    amount: number;
    category_id: string;
    bank_account_id: string;
    transaction_date: string;
    payment_method: PaymentMethod;
    status: TransactionStatus;
    case_id?: string;
    client_id?: string;
    notes?: string;
    document_id?: string;
    law_office_id: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    // Relations
    category?: Category;
    bank_account?: BankAccount;
}

export interface MonthlyStats {
    year: number;
    month: number;
    income: number;
    expenses: number;
    balance: number;
    transactionCount: number;
}

export interface TransactionFilters {
    type?: TransactionType;
    status?: TransactionStatus;
    bank_account_id?: string;
    category_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
}
