import { apiClient } from '@/services/api/client';
import type {
    Receivable,
    CreateReceivableDTO,
    RecordPaymentDTO,
    Payable,
    CreatePayableDTO,
    ApprovePayableDTO,
    FinanceQuery,
    PaginatedResponse,
    DashboardKPIs,
    CashFlowProjection,
    AgingReport,
    MonthlySummary,
    // New Types
    FinanceCategory,
    CreateCategoryDTO,
    UpdateCategoryDTO,
    BankAccount,
    CreateBankAccountDTO,
    UpdateBankAccountDTO,
    RecurringTransaction,
    CreateRecurringTransactionDTO,
    UpdateRecurringTransactionDTO,
    Budget,
    CreateBudgetDTO,
    BudgetSummary,
} from '../types/finance';

/**
 * Finance API Service
 * Serviço para interação com os endpoints do módulo financeiro
 */
export const financeApi = {
    // =============================================
    // CATEGORIES
    // =============================================
    getCategories: async (type?: string) => {
        const { data } = await apiClient.get<FinanceCategory[]>('/finance/categories', { params: { type } });
        return data;
    },

    createCategory: async (category: CreateCategoryDTO) => {
        const { data } = await apiClient.post<FinanceCategory>('/finance/categories', category);
        return data;
    },

    updateCategory: async (id: string, category: UpdateCategoryDTO) => {
        const { data } = await apiClient.put<FinanceCategory>(`/finance/categories/${id}`, category);
        return data;
    },

    deleteCategory: async (id: string) => {
        await apiClient.delete(`/finance/categories/${id}`);
    },

    seedDefaultCategories: async () => {
        const { data } = await apiClient.post<{ message: string }>('/finance/categories/seed-defaults');
        return data;
    },

    getCategoryStats: async (startDate?: string, endDate?: string) => {
        const { data } = await apiClient.get<any[]>('/finance/categories/stats', { params: { startDate, endDate } });
        return data;
    },

    // =============================================
    // BANK ACCOUNTS
    // =============================================
    getBankAccounts: async () => {
        const { data } = await apiClient.get<BankAccount[]>('/finance/accounts');
        return data;
    },

    getAccountById: async (id: string) => {
        const { data } = await apiClient.get<BankAccount>(`/finance/accounts/${id}`);
        return data;
    },

    createBankAccount: async (account: CreateBankAccountDTO) => {
        const { data } = await apiClient.post<BankAccount>('/finance/accounts', account);
        return data;
    },

    updateBankAccount: async (id: string, account: UpdateBankAccountDTO) => {
        const { data } = await apiClient.put<BankAccount>(`/finance/accounts/${id}`, account);
        return data;
    },

    deleteBankAccount: async (id: string) => {
        await apiClient.delete(`/finance/accounts/${id}`);
    },

    getAccountBalance: async () => {
        const { data } = await apiClient.get<{ total: number; accounts: any[] }>('/finance/accounts/balance');
        return data;
    },

    // =============================================
    // RECURRING TRANSACTIONS
    // =============================================
    getRecurringTransactions: async () => {
        const { data } = await apiClient.get<RecurringTransaction[]>('/finance/recurring');
        return data;
    },

    createRecurringTransaction: async (dto: CreateRecurringTransactionDTO) => {
        const { data } = await apiClient.post<RecurringTransaction>('/finance/recurring', dto);
        return data;
    },

    updateRecurringTransaction: async (id: string, dto: UpdateRecurringTransactionDTO) => {
        const { data } = await apiClient.put<RecurringTransaction>(`/finance/recurring/${id}`, dto);
        return data;
    },

    deleteRecurringTransaction: async (id: string) => {
        await apiClient.delete(`/finance/recurring/${id}`);
    },

    processRecurringTransactions: async () => {
        const { data } = await apiClient.post<{ count: number }>('/finance/recurring/process-now');
        return data;
    },

    // =============================================
    // BUDGET PLANNING
    // =============================================
    getBudgets: async (year: number, month: number) => {
        const { data } = await apiClient.get<BudgetSummary>('/finance/budgets', { params: { year, month } });
        return data;
    },

    upsertBudget: async (dto: CreateBudgetDTO) => {
        const { data } = await apiClient.post<Budget>('/finance/budgets', dto);
        return data;
    },

    // =============================================
    // TRANSACTIONS (Unified)
    // =============================================
    getTransactions: async (params?: FinanceQuery) => {
        const { data } = await apiClient.get<PaginatedResponse<any>>('/finance/transactions', { params });
        return data;
    },

    getTransactionStats: async (year: number, month: number) => {
        const { data } = await apiClient.get<any>('/finance/transactions/stats/monthly', { params: { year, month } });
        return data;
    },

    // =============================================
    // RECEIVABLES (Contas a Receber)
    // =============================================

    getReceivables: async (params?: FinanceQuery) => {
        const { data } = await apiClient.get<PaginatedResponse<Receivable>>('/finance/receivables', { params });
        return data;
    },

    getReceivableById: async (id: string) => {
        const { data } = await apiClient.get<Receivable>(`/finance/receivables/${id}`);
        return data;
    },

    createReceivable: async (receivable: CreateReceivableDTO) => {
        const { data } = await apiClient.post<Receivable>('/finance/receivables', receivable);
        return data;
    },

    recordPayment: async (id: string, payment: RecordPaymentDTO) => {
        const { data } = await apiClient.patch<Receivable>(`/finance/receivables/${id}/record-payment`, payment);
        return data;
    },

    cancelReceivable: async (id: string, reason?: string) => {
        const { data } = await apiClient.patch<Receivable>(`/finance/receivables/${id}/cancel`, { reason });
        return data;
    },

    // =============================================
    // PAYABLES (Contas a Pagar)
    // =============================================

    getPayables: async (params?: FinanceQuery) => {
        const { data } = await apiClient.get<PaginatedResponse<Payable>>('/finance/payables', { params });
        return data;
    },

    getPayableById: async (id: string) => {
        const { data } = await apiClient.get<Payable>(`/finance/payables/${id}`);
        return data;
    },

    createPayable: async (payable: CreatePayableDTO) => {
        const { data } = await apiClient.post<Payable>('/finance/payables', payable);
        return data;
    },

    approvePayable: async (id: string, approval: ApprovePayableDTO) => {
        const { data } = await apiClient.patch<Payable>(`/finance/payables/${id}/approve`, approval);
        return data;
    },

    markPayableAsPaid: async (id: string, paymentDate?: string) => {
        const { data } = await apiClient.patch<Payable>(`/finance/payables/${id}/mark-paid`, { payment_date: paymentDate });
        return data;
    },

    // =============================================
    // REPORTS & DASHBOARD
    // =============================================

    getDashboardKPIs: async () => {
        const { data } = await apiClient.get<DashboardKPIs>('/finance/reports/dashboard');
        return data;
    },

    getCashFlowProjection: async (days?: number) => {
        const { data } = await apiClient.get<CashFlowProjection>('/finance/reports/cash-flow', { params: { days } });
        return data;
    },

    getAgingReport: async (type: 'receivables' | 'payables' = 'receivables') => {
        const { data } = await apiClient.get<AgingReport>('/finance/reports/aging', { params: { type } });
        return data;
    },

    getMonthlySummary: async (year?: number, month?: number) => {
        const { data } = await apiClient.get<MonthlySummary>('/finance/reports/monthly', { params: { year, month } });
        return data;
    },
};
