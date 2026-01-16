import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeiroApi } from '@/services/api/financeiro.service';
import { toast } from 'react-hot-toast';
import { RegraFeeSplit } from '@/types/financeiro.types';

export const useRegrasFeeSplit = () => {
  return useQuery<RegraFeeSplit[]>({
    queryKey: ['regras-fee-split'],
    queryFn: () => financeiroApi.getRegrasFeeSplit(),
  });
};

export const useCreateRegraFeeSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<RegraFeeSplit>) => financeiroApi.createRegraFeeSplit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regras-fee-split'] });
      toast.success('Regra de divisão criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar regra');
    },
  });
};

export const useUpdateRegraFeeSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RegraFeeSplit> }) =>
      financeiroApi.updateRegraFeeSplit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regras-fee-split'] });
      toast.success('Regra atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar regra');
    },
  });
};

export const useDeleteRegraFeeSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => financeiroApi.deleteRegraFeeSplit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regras-fee-split'] });
      toast.success('Regra excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir regra');
    },
  });
};

export const useCalcularDivisao = () => {
  return useMutation({
    mutationFn: ({ honorarioId, regraId }: { honorarioId: string; regraId: string }) =>
      financeiroApi.calcularDivisao(honorarioId, regraId),
    onSuccess: (data) => {
      const valor = data.valor_total || data.total || 0;
      toast.success(`Divisão calculada: R$ ${Number(valor).toFixed(2)}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao calcular divisão');
    },
  });
};

export const useExtratoDivisoes = (advogadoId: string, params: any) => {
  return useQuery({
    queryKey: ['extrato-divisoes', advogadoId, params],
    queryFn: () => financeiroApi.getExtratoDivisoes(advogadoId, params),
    enabled: !!advogadoId,
  });
};
