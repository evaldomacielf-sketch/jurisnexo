import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeiroApi } from '@/services/api/financeiro.service';
import { toast } from 'react-hot-toast';
import { Honorario, PaginatedResponse } from '@/types/financeiro.types';

export const useHonorarios = (filters?: any) => {
    return useQuery<PaginatedResponse<Honorario>>({
        queryKey: ['honorarios', filters],
        queryFn: () => financeiroApi.getHonorarios(filters),
    });
};

export const useCreateHonorario = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Honorario>) => financeiroApi.createHonorario(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['honorarios'] });
            toast.success('Honorário criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar honorário');
        },
    });
};

export const useUpdateHonorario = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Honorario> }) =>
            financeiroApi.updateHonorario(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['honorarios'] });
            toast.success('Honorário atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar honorário');
        },
    });
};

export const useDeleteHonorario = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => financeiroApi.deleteHonorario(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['honorarios'] });
            toast.success('Honorário excluído com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao excluir honorário');
        },
    });
};

export const useAnaliseHonorarios = (params: any) => {
    return useQuery({
        queryKey: ['analise-honorarios', params],
        queryFn: () => financeiroApi.getAnaliseHonorarios(params),
    });
};

export const useRegistrarPagamentoHonorario = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            financeiroApi.registrarPagamentoHonorario(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['honorarios'] });
            // Invalidate details too
            queryClient.invalidateQueries({ queryKey: ['honorario'] });
            toast.success('Pagamento registrado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao registrar pagamento');
        },
    });
};

export const useHonorarioDetails = (id: string) => {
    return useQuery({
        queryKey: ['honorario', id],
        queryFn: () => financeiroApi.getHonorarioById(id),
        enabled: !!id,
    });
};
