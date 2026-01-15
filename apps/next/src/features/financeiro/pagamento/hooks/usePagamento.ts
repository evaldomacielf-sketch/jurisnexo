import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeiroApi } from '@/services/api/financeiro.service';
import { toast } from 'react-hot-toast';

export const useCreateCheckoutSession = () => {
    return useMutation({
        mutationFn: (data: any) => financeiroApi.createCheckoutSession(data),
        onSuccess: (data) => {
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar sessão de pagamento');
        },
    });
};

/**
 * Hook para gerar link de pagamento sem redirecionar automaticamente.
 * Usado na página de detalhes do honorário para copiar/enviar o link.
 */
export const useGeneratePaymentLink = () => {
    return useMutation({
        mutationFn: (data: {
            honorario_id: string;
            valor: number;
            metodo_pagamento: 'pix' | 'cartao_credito' | 'boleto';
            cliente_email?: string;
        }) => financeiroApi.createCheckoutSession(data),
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao gerar link de pagamento');
        },
    });
};

export const useCheckoutStatus = (sessionId: string) => {
    return useQuery({
        queryKey: ['checkout-status', sessionId],
        queryFn: () => financeiroApi.getCheckoutStatus(sessionId),
        enabled: !!sessionId,
        refetchInterval: (query) => {
            const data = query.state.data as any;
            // Refetch a cada 3s se status for pendente ou processando
            if (data?.status === 'pendente' || data?.status === 'processando') {
                return 3000;
            }
            return false;
        },
    });
};

export const useCancelCheckout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: string) => financeiroApi.cancelCheckout(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checkout-status'] });
            toast.success('Pagamento cancelado com sucesso');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao cancelar pagamento');
        },
    });
};

export const useConfiguracoesPortal = () => {
    return useQuery({
        queryKey: ['configuracoes-portal'],
        queryFn: () => financeiroApi.getConfiguracoesPortal(),
    });
};

export const useUpdateConfiguracoesPortal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => financeiroApi.updateConfiguracoesPortal(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configuracoes-portal'] });
            toast.success('Configurações atualizadas com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar configurações');
        },
    });
};
