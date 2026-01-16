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
  Building2,
} from 'lucide-react';
import { financeApi } from '@/lib/api/finance';
import { ApprovalStatus } from '@/lib/types/finance';
import type { Payable, CreatePayableDTO, PaymentStatus, FinanceQuery } from '@/lib/types/finance';

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
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      <Icon className="h-3 w-3" />
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
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
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
      await financeApi.approvePayable(id, {
        status: ApprovalStatus.REJECTED,
        rejection_reason: reason,
      });
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contas a Pagar</h1>
          <p className="mt-1 text-gray-500">Gerencie despesas e pagamentos a fornecedores</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
        >
          <Plus className="h-4 w-4" />
          Nova Conta
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por fornecedor ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | '')}
            className="rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
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
            className="rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
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
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fornecedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aprovação
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-4 animate-pulse rounded bg-gray-200" />
                      </td>
                    </tr>
                  ))
              ) : payables.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Building2 className="mx-auto mb-2 h-12 w-12 opacity-20" />
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
                        <Calendar className="h-4 w-4 text-gray-400" />
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
                              className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200"
                              title="Aprovar"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
                              title="Rejeitar"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {item.approval_status === 'APPROVED' && item.status === 'PENDING' && (
                          <button
                            onClick={() => handleMarkAsPaid(item.id)}
                            className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200"
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
          <div className="flex items-center justify-between border-t px-6 py-4">
            <p className="text-sm text-gray-500">
              Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1}
                className="rounded-lg border px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
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
  onSubmit,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nova Conta a Pagar</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Fornecedor *</label>
            <input
              type="text"
              value={formData.supplier_name}
              onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do fornecedor"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">CNPJ/CPF</label>
            <input
              type="text"
              value={formData.supplier_document || ''}
              onChange={(e) => setFormData({ ...formData, supplier_document: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="00.000.000/0001-00"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Descrição *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Aluguel do escritório"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Valor *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Vencimento *</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="DD/MM/AAAA"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Observações adicionais..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Criar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
