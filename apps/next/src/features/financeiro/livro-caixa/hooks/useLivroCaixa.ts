import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeiroApi } from '@/services/api/financeiro.service';
import { toast } from 'react-hot-toast';
import { LivroCaixaEntry, PaginatedResponse } from '@/types/financeiro.types';

export const useLivroCaixa = (filters?: any) => {
    return useQuery<PaginatedResponse<LivroCaixaEntry>>({
        queryKey: ['livro-caixa', filters],
        queryFn: () => financeiroApi.getLivroCaixaEntries(filters),
    });
};

export const useCreateLivroCaixaEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<LivroCaixaEntry>) => financeiroApi.createLivroCaixaEntry(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['livro-caixa'] });
            toast.success('Lançamento criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar lançamento');
        },
    });
};

export const useUpdateLivroCaixaEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<LivroCaixaEntry> }) =>
            financeiroApi.updateLivroCaixaEntry(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['livro-caixa'] });
            toast.success('Lançamento atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar lançamento');
        },
    });
};

export const useDeleteLivroCaixaEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => financeiroApi.deleteLivroCaixaEntry(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['livro-caixa'] });
            toast.success('Lançamento excluído com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao excluir lançamento');
        },
    });
};

export const useRelatorioFiscal = (params: any) => {
    return useQuery({
        queryKey: ['relatorio-fiscal', params],
        queryFn: () => financeiroApi.getRelatorioFiscal(params),
        enabled: !!params.ano,
    });
};

export const useExportarLivroCaixa = () => {
    return useMutation({
        mutationFn: ({ formato, filters }: { formato: 'pdf' | 'excel'; filters: any }) =>
            financeiroApi.exportarLivroCaixa(formato, filters),
        onSuccess: (blob, variables) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `livro-caixa.${variables.formato === 'pdf' ? 'pdf' : 'xlsx'}`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Exportação concluída com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao exportar livro caixa');
        },
    });
};
