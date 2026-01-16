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
} from 'lucide-react';
import { financeApi } from '@/lib/api/finance';
import type {
  Receivable,
  CreateReceivableDTO,
  RecordPaymentDTO,
  PaymentStatus,
  FinanceQuery,
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
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      <Icon className="h-3 w-3" />
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

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);

  useEffect(() => {
    loadReceivables();
  }, [pagination.page, statusFilter]);

  async function loadReceivables() {
    setIsLoading(true);
    setError(null);
    try {
      const params: FinanceQuery = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter) params.status = statusFilter as PaymentStatus;

      const response = await financeApi.getReceivables(params);
      setReceivables(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error loading receivables:', err);
      setError(err.message || 'Erro ao carregar contas a receber');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateReceivable(data: CreateReceivableDTO) {
    try {
      await financeApi.createReceivable(data);
      setShowCreateModal(false);
      loadReceivables();
    } catch (err: any) {
      alert('Erro ao criar conta: ' + err.message);
    }
  }

  async function handleRecordPayment(id: string, data: RecordPaymentDTO) {
    try {
      await financeApi.recordPayment(id, data);
      setShowPaymentModal(null);
      loadReceivables();
    } catch (err: any) {
      alert('Erro ao registrar pagamento: ' + err.message);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contas a Receber</h1>
          <p className="mt-1 text-gray-500">Gerencie honorários e receitas do escritório</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
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
                placeholder="Buscar por cliente ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | '')}
            className="rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
            aria-label="Filtrar por status"
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="PAID">Pago</option>
            <option value="PARTIAL">Parcial</option>
            <option value="OVERDUE">Vencido</option>
            <option value="CANCELLED">Cancelado</option>
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
                  Cliente
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
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-4 animate-pulse rounded bg-gray-200" />
                      </td>
                    </tr>
                  ))
              ) : receivables.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <DollarSign className="mx-auto mb-2 h-12 w-12 opacity-20" />
                    <p>Nenhuma conta a receber encontrada</p>
                  </td>
                </tr>
              ) : (
                receivables.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {item.client_name || 'Cliente não informado'}
                      </p>
                      <p className="text-sm text-gray-500">{item.client_document}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.description}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{formatCurrency(item.amount)}</p>
                      {item.paid_amount > 0 && (
                        <p className="text-sm text-green-600">
                          Pago: {formatCurrency(item.paid_amount)}
                        </p>
                      )}
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
                    <td className="px-6 py-4 text-right">
                      {item.status !== 'PAID' && item.status !== 'CANCELLED' && (
                        <button
                          onClick={() => setShowPaymentModal(item.id)}
                          className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200"
                        >
                          Registrar Pagamento
                        </button>
                      )}
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
        <CreateReceivableModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateReceivable}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <RecordPaymentModal
          onClose={() => setShowPaymentModal(null)}
          onSubmit={(data) => handleRecordPayment(showPaymentModal, data)}
        />
      )}
    </div>
  );
}

// Create Receivable Modal
function CreateReceivableModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: CreateReceivableDTO) => void;
}) {
  const [formData, setFormData] = useState<CreateReceivableDTO>({
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
          <h2 className="text-lg font-semibold">Nova Conta a Receber</h2>
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Cliente</label>
            <input
              type="text"
              value={formData.client_name || ''}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do cliente"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Descrição *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Honorários advocatícios"
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
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Criar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Record Payment Modal
function RecordPaymentModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: RecordPaymentDTO) => void;
}) {
  const [formData, setFormData] = useState<RecordPaymentDTO>({
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Registrar Pagamento</h2>
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Valor Pago *</label>
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
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Data do Pagamento
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="DD/MM/AAAA"
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
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Confirmar Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
