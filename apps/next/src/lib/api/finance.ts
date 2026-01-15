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
} from '../types/finance';

/**
 * Finance API Service
 * Serviço para interação com os endpoints do módulo financeiro
 */
export const financeApi = {
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
