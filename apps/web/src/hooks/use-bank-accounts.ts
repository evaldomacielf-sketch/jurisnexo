import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { BankAccount } from '@/types/financial';

export function useBankAccounts(includeInactive = false) {
  return useQuery({
    queryKey: ['bankAccounts', includeInactive],
    queryFn: async () => {
      const { data } = await apiClient.get<BankAccount[]>('/financial/bank-accounts', {
        params: { includeInactive },
      });
      return data;
    },
  });
}

export function useConsolidatedBalance() {
  return useQuery({
    queryKey: ['consolidatedBalance'],
    queryFn: async () => {
      const { data } = await apiClient.get('/financial/bank-accounts/balance');
      return data;
    },
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Partial<BankAccount>) => {
      const { data } = await apiClient.post('/financial/bank-accounts', account);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['consolidatedBalance'] });
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BankAccount> }) => {
      const response = await apiClient.put(`/financial/bank-accounts/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['consolidatedBalance'] });
    },
  });
}
