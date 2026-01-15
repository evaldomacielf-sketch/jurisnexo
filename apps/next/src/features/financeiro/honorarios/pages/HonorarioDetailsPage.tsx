'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    ArrowLeft,
    FileText,
    CreditCard,
    Calendar,
    Plus,
    Send,
    User,
    DollarSign,
    CheckCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Modal } from '@/components/shared/Modal';
import { FormField } from '@/components/shared/FormField';
import { Table } from '@/components/shared/Table';
import {
    useHonorarioDetails,
    useRegistrarPagamentoHonorario
} from '../hooks/useHonorarios';
import { useGeneratePaymentLink } from '@/features/financeiro/pagamento/hooks/usePagamento';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

// Esquema de validação para registro de pagamento manual
const pagamentoSchema = z.object({
    valor: z.number().min(0.01, 'Valor deve ser maior que 0'),
    data_pagamento: z.string().min(1, 'Data é obrigatória'),
    forma_pagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
    observacoes: z.string().optional(),
});

type PagamentoFormData = z.infer<typeof pagamentoSchema>;

export default function HonorarioDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const { data: honorario, isPending, error } = useHonorarioDetails(id);
    const registrarPagamento = useRegistrarPagamentoHonorario();
    const gerarLink = useGeneratePaymentLink();

    const [showPagamentoModal, setShowPagamentoModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);

    const form = useForm<PagamentoFormData>({
        resolver: zodResolver(pagamentoSchema),
        defaultValues: {
            valor: 0,
            data_pagamento: new Date().toISOString().split('T')[0],
            forma_pagamento: '',
            observacoes: '',
        },
    });

    const onSubmitPagamento = async (data: PagamentoFormData) => {
        try {
            await registrarPagamento.mutateAsync({
                id,
                data: {
                    amount: data.valor,
                    payment_date: data.data_pagamento,
                    payment_method: data.forma_pagamento,
                    notes: data.observacoes,
                },
            });
            setShowPagamentoModal(false);
            form.reset();
        } catch {
            // Error handled by hook
        }
    };

    const handleGerarLink = async (metodo: 'pix' | 'cartao_credito' | 'boleto') => {
        try {
            const valorPendente = (honorario?.valor_total || 0) - (honorario?.valor_pago || 0);

            const result = await gerarLink.mutateAsync({
                honorario_id: id,
                valor: valorPendente,
                metodo_pagamento: metodo,
                cliente_email: honorario?.cliente?.email || '',
            });

            if (result?.checkout_url) {
                setPaymentLink(result.checkout_url);
                toast.success('Link de pagamento gerado!');
            }
        } catch {
            toast.error('Erro ao gerar link de pagamento');
        }
    };

    const handleCopyLink = () => {
        if (paymentLink) {
            navigator.clipboard.writeText(paymentLink);
            toast.success('Link copiado para a área de transferência!');
        }
    };

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !honorario) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800">Honorário não encontrado</h2>
                        <p className="text-gray-500 mt-2">O contrato solicitado não existe ou foi removido.</p>
                        <button
                            onClick={() => router.push('/financeiro/honorarios')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Voltar para Honorários
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    const valorPendente = (honorario.valor_total || 0) - (honorario.valor_pago || 0);
    const percentPago = honorario.valor_total > 0
        ? Math.round((honorario.valor_pago / honorario.valor_total) * 100)
        : 0;

    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
        pendente: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" />, label: 'Pendente' },
        pago: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Pago' },
        parcial_pago: { color: 'bg-blue-100 text-blue-800', icon: <DollarSign className="w-4 h-4" />, label: 'Parcialmente Pago' },
        atrasado: { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-4 h-4" />, label: 'Atrasado' },
        cancelado: { color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-4 h-4" />, label: 'Cancelado' },
    };

    const currentStatus = statusConfig[honorario.status] || statusConfig.pendente;

    const paymentColumns = [
        { key: 'payment_date', header: 'Data', render: (row: any) => formatDate(row.payment_date) },
        { key: 'amount', header: 'Valor', render: (row: any) => formatCurrency(row.amount) },
        { key: 'payment_method', header: 'Forma', render: (row: any) => row.payment_method },
        { key: 'notes', header: 'Observações', render: (row: any) => row.notes || '-' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/financeiro/honorarios')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Voltar para lista"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Detalhes do Honorário</h1>
                        <p className="text-gray-500 text-sm">ID: {honorario.id}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentStatus.color}`}>
                    {currentStatus.icon}
                    <span className="text-sm font-medium">{currentStatus.label}</span>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Valor Total</p>
                            <p className="text-xl font-bold text-gray-800">{formatCurrency(honorario.valor_total)}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Valor Pago</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(honorario.valor_pago)}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Valor Pendente</p>
                            <p className="text-xl font-bold text-yellow-600">{formatCurrency(valorPendente)}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Vencimento</p>
                            <p className="text-xl font-bold text-gray-800">
                                {honorario.data_vencimento ? formatDate(honorario.data_vencimento) : '-'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Barra de progresso */}
            <Card>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Progresso do Pagamento</span>
                    <span className="text-sm font-bold text-blue-600">{percentPago}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentPago}%` }}
                    ></div>
                </div>
            </Card>

            {/* Informações do Contrato e Cliente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Informações do Contrato">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Descrição</p>
                                <p className="font-medium">{honorario.descricao || 'Sem descrição'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Forma de Pagamento</p>
                                <p className="font-medium">{honorario.forma_pagamento || 'Não definida'}</p>
                            </div>
                        </div>
                        {honorario.observacoes && (
                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Observações</p>
                                    <p className="font-medium">{honorario.observacoes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Informações do Cliente">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-lg">{honorario.cliente?.nome || 'Cliente não identificado'}</p>
                                <p className="text-sm text-gray-500">{honorario.cliente?.email || ''}</p>
                            </div>
                        </div>
                        {honorario.cliente?.telefone && (
                            <p className="text-sm text-gray-600">📞 {honorario.cliente.telefone}</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Ações */}
            <Card title="Ações">
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowPagamentoModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        disabled={valorPendente <= 0}
                    >
                        <Plus className="w-4 h-4" />
                        Registrar Pagamento Manual
                    </button>

                    <button
                        onClick={() => setShowLinkModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={valorPendente <= 0}
                    >
                        <Send className="w-4 h-4" />
                        Gerar Link de Pagamento
                    </button>
                </div>
            </Card>

            {/* Histórico de Pagamentos */}
            <Card title="Histórico de Pagamentos">
                <Table
                    data={honorario.pagamentos || []}
                    columns={paymentColumns}
                    emptyMessage="Nenhum pagamento registrado"
                />
            </Card>

            {/* Modal de Registro de Pagamento */}
            <Modal
                isOpen={showPagamentoModal}
                onClose={() => setShowPagamentoModal(false)}
                title="Registrar Pagamento Manual"
                size="md"
            >
                <form onSubmit={form.handleSubmit(onSubmitPagamento)} className="space-y-4">
                    <FormField
                        label="Valor"
                        name="valor"
                        type="number"
                        register={form.register}
                        error={form.formState.errors.valor?.message}
                        required
                    />
                    <FormField
                        label="Data do Pagamento"
                        name="data_pagamento"
                        type="date"
                        register={form.register}
                        error={form.formState.errors.data_pagamento?.message}
                        required
                    />
                    <FormField
                        label="Forma de Pagamento"
                        name="forma_pagamento"
                        type="select"
                        register={form.register}
                        error={form.formState.errors.forma_pagamento?.message}
                        options={[
                            { value: '', label: 'Selecione...' },
                            { value: 'pix', label: 'PIX' },
                            { value: 'cartao_credito', label: 'Cartão de Crédito' },
                            { value: 'boleto', label: 'Boleto' },
                            { value: 'transferencia', label: 'Transferência' },
                            { value: 'dinheiro', label: 'Dinheiro' },
                        ]}
                        required
                    />
                    <FormField
                        label="Observações"
                        name="observacoes"
                        type="textarea"
                        register={form.register}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowPagamentoModal(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={registrarPagamento.isPending}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {registrarPagamento.isPending ? 'Salvando...' : 'Registrar Pagamento'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Geração de Link */}
            <Modal
                isOpen={showLinkModal}
                onClose={() => {
                    setShowLinkModal(false);
                    setPaymentLink(null);
                }}
                title="Gerar Link de Pagamento"
                size="md"
            >
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Valor a cobrar:</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(valorPendente)}</p>
                    </div>

                    {!paymentLink ? (
                        <>
                            <p className="text-sm text-gray-600">Escolha o método de pagamento:</p>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => handleGerarLink('pix')}
                                    disabled={gerarLink.isPending}
                                    className="p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                                >
                                    <span className="text-2xl">🏦</span>
                                    <p className="mt-2 font-medium">PIX</p>
                                </button>
                                <button
                                    onClick={() => handleGerarLink('cartao_credito')}
                                    disabled={gerarLink.isPending}
                                    className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                                >
                                    <span className="text-2xl">💳</span>
                                    <p className="mt-2 font-medium">Cartão</p>
                                </button>
                                <button
                                    onClick={() => handleGerarLink('boleto')}
                                    disabled={gerarLink.isPending}
                                    className="p-4 border rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-center"
                                >
                                    <span className="text-2xl">📄</span>
                                    <p className="mt-2 font-medium">Boleto</p>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-700 font-medium">✅ Link gerado com sucesso!</p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={paymentLink}
                                    readOnly
                                    aria-label="Link de pagamento"
                                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Copiar
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Envie este link para o cliente realizar o pagamento.
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
