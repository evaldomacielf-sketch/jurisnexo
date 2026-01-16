'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';

type SortDirection = 'asc' | 'desc';
type SortField = 'date' | 'description' | 'amount' | 'status';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  date: string;
  due_date?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  category?: string;
  categoryColor?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick?: (transaction: Transaction) => void;
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

// Status config
const STATUS_CONFIG = {
  PENDING: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PAID: { label: 'Pago', class: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  OVERDUE: { label: 'Vencido', class: 'bg-red-100 text-red-800', icon: AlertTriangle },
  CANCELLED: { label: 'Cancelado', class: 'bg-gray-100 text-gray-800', icon: X },
};

export function TransactionTable({
  transactions,
  isLoading = false,
  page,
  totalPages,
  onPageChange,
  onRowClick,
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'date':
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * modifier;
      case 'description':
        return a.description.localeCompare(b.description) * modifier;
      case 'amount':
        return (a.amount - b.amount) * modifier;
      case 'status':
        return a.status.localeCompare(b.status) * modifier;
      default:
        return 0;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                >
                  Data
                  <SortIcon field="date" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('description')}
                  className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                >
                  Descrição
                  <SortIcon field="description" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Categoria
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                >
                  Valor
                  <SortIcon field="amount" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              Array(10)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
            ) : sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <Calendar className="mx-auto mb-2 h-12 w-12 opacity-20" />
                  <p>Nenhuma transação encontrada</p>
                </td>
              </tr>
            ) : (
              sortedTransactions.map((tx) => {
                const statusConfig = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = statusConfig.icon;

                return (
                  <tr
                    key={tx.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => onRowClick?.(tx)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDate(tx.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tx.type === 'INCOME' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900">{tx.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tx.category && (
                        <Badge variant="secondary" className="category-badge">
                          {tx.category}
                          <style jsx>{`
                            :global(.category-badge) {
                              background-color: ${tx.categoryColor}20 !important;
                              color: ${tx.categoryColor || '#6B7280'} !important;
                            }
                          `}</style>
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.class}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
          <p className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border bg-white px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg border bg-white px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
