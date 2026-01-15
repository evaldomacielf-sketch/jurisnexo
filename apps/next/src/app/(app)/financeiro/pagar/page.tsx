'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    DollarSign,
    Calendar,
    CheckCircle2,
    Clock,
    AlertTriangle,
    X,
    ChevronLeft,
    ChevronRight,
    ThumbsUp,
    ThumbsDown,
    Building2
} from 'lucide-react';
import { financeApi } from '@/lib/api/finance';
import { ApprovalStatus } from '@/lib/types/finance';
import type {
    Payable,
    CreatePayableDTO,
    PaymentStatus,
    FinanceQuery
} from '@/lib/types/finance';

// Status badge component
function StatusBadge({ status }: { status: PaymentStatus }) {
    const config: Record<PaymentStatus, { label: string; class: string; icon: React.ElementType }> = {
        PENDING: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
        PAID: { label: 'Pago', class: 'bg-green-100 text-green-800', icon: CheckCircle2 },
        PARTIAL: { label: 'Parcial', class: 'bg-blue-100 text-blue-800', icon: DollarSign },
        OVERDUE: { label: 'Vencido', class: 'bg-red-100 text-red-800', icon: AlertTriangle },
        CANCELLED: { label: 'Cancelado', class: 'bg-gray-100 text-gray-800', icon: X },
    };

    const { label, class: className, icon: Icon } = config[status] || config.PENDING;

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}

// Approval badge
function ApprovalBadge({ status }: { status: ApprovalStatus }) {
    const config: Record<ApprovalStatus, { label: string; class: string }> = {
        PENDING: { label: 'Aguardando', class: 'bg-purple-100 text-purple-800' },
        APPROVED: { label: 'Aprovado', class: 'bg-green-100 text-green-800' },
        REJECTED: { label: 'Rejeitado', class: 'bg-red-100 text-red-800' },
    };

    const { label, class: className } = config[status] || config.PENDING;

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}

// Format currency
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

// Format date
function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
}

export default function PayablesPage() {
    const [payables, setPayables] = useState<Payable[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
    const [approvalFilter, setApprovalFilter] = useState<ApprovalStatus | ''>('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadPayables();
    }, [pagination.page, statusFilter, approvalFilter]);

    async function loadPayables() {
        setIsLoading(true);
        setError(null);
        try {
            const params: FinanceQuery = {
                page: pagination.page,
                limit: pagination.limit,
            };
            if (statusFilter) params.status = statusFilter as PaymentStatus;
            if (approvalFilter) params.approval_status = approvalFilter as ApprovalStatus;

            const response = await financeApi.getPayables(params);
            setPayables(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            console.error('Error loading payables:', err);
            setError(err.message || 'Erro ao carregar contas a pagar');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreatePayable(data: CreatePayableDTO) {
        try {
            await financeApi.createPayable(data);
            setShowCreateModal(false);
            loadPayables();
        } catch (err: any) {
            alert('Erro ao criar conta: ' + err.message);
        }
    }

    async function handleApprove(id: string) {
        try {
            await financeApi.approvePayable(id, { status: ApprovalStatus.APPROVED });
            loadPayables();
        } catch (err: any) {
            alert('Erro ao aprovar: ' + err.message);
        }
    }

    async function handleReject(id: string) {
        const reason = prompt('Motivo da rejeição:');
        if (!reason) return;
        try {
            await financeApi.approvePayable(id, { status: ApprovalStatus.REJECTED, rejection_reason: reason });
            loadPayables();
        } catch (err: any) {
            alert('Erro ao rejeitar: ' + err.message);
        }
    }

    async function handleMarkAsPaid(id: string) {
        try {
            await financeApi.markPayableAsPaid(id);
            loadPayables();
        } catch (err: any) {
            alert('Erro ao marcar como pago: ' + err.message);
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contas a Pagar</h1>
                    <p className="text-gray-500 mt-1">Gerencie despesas e pagamentos a fornecedores</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nova Conta
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border p-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por fornecedor ou descrição..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | '')}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Filtrar por status de pagamento"
                    >
                        <option value="">Todos os status</option>
                        <option value="PENDING">Pendente</option>
                        <option value="PAID">Pago</option>
                        <option value="OVERDUE">Vencido</option>
                    </select>
                    <select
                        value={approvalFilter}
                        onChange={(e) => setApprovalFilter(e.target.value as ApprovalStatus | '')}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Filtrar por aprovação"
                    >
                        <option value="">Todas aprovações</option>
                        <option value="PENDING">Aguardando</option>
                        <option value="APPROVED">Aprovado</option>
                        <option value="REJECTED">Rejeitado</option>
                    </select>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aprovação</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : payables.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <Building2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p>Nenhuma conta a pagar encontrada</p>
                                    </td>
                                </tr>
                            ) : (
                                payables.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{item.supplier_name}</p>
                                            <p className="text-sm text-gray-500">{item.supplier_document}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{item.description}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{formatCurrency(item.amount)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {formatDate(item.due_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <ApprovalBadge status={item.approval_status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {item.approval_status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(item.id)}
                                                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                                            title="Aprovar"
                                                        >
                                                            <ThumbsUp className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(item.id)}
                                                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                                            title="Rejeitar"
                                                        >
                                                            <ThumbsDown className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {item.approval_status === 'APPROVED' && item.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleMarkAsPaid(item.id)}
                                                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                                                    >
                                                        Marcar Pago
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <p className="text-sm text-gray-500">
                            Mostrando {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                disabled={pagination.page <= 1}
                                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <CreatePayableModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreatePayable}
                />
            )}
        </div>
    );
}

// Create Payable Modal
function CreatePayableModal({
    onClose,
    onSubmit
}: {
    onClose: () => void;
    onSubmit: (data: CreatePayableDTO) => void;
}) {
    const [formData, setFormData] = useState<CreatePayableDTO>({
        supplier_name: '',
        description: '',
        amount: 0,
        due_date: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(formData);
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Nova Conta a Pagar</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor *</label>
                        <input
                            type="text"
                            value={formData.supplier_name}
                            onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Nome do fornecedor"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ/CPF</label>
                        <input
                            type="text"
                            value={formData.supplier_document || ''}
                            onChange={(e) => setFormData({ ...formData, supplier_document: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="00.000.000/0001-00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Aluguel do escritório"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento *</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            Criar Conta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
