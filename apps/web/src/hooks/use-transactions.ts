import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Transaction, TransactionFilters, MonthlyStats } from '@/types/financial';

// Fetch transactions list
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/financial/transactions', { params: filters });
      return data;
    },
  });
}

// Fetch monthly stats
export function useMonthlyStats(year: number, month: number) {
  return useQuery({
    queryKey: ['monthlyStats', year, month],
    queryFn: async () => {
      const { data } = await apiClient.get<MonthlyStats>('/financial/transactions/stats/monthly', {
        params: { year, month },
      });
      return data;
    },
  });
}

// Fetch transactions by category
export function useTransactionsByCategory(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['transactionsByCategory', startDate, endDate],
    queryFn: async () => {
      const { data } = await apiClient.get('/financial/transactions/stats/by-category', {
        params: { startDate, endDate },
      });
      return data;
    },
  });
}

// Create transaction mutation
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Partial<Transaction>) => {
      const { data } = await apiClient.post('/financial/transactions', transaction);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyStats'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
}

// Update transaction mutation
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transaction> }) => {
      const response = await apiClient.put(`/financial/transactions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyStats'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
}

// Delete transaction mutation
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/financial/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyStats'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
}
