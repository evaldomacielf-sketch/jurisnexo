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
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
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
        return sortDirection === 'asc' ?
            <ChevronUp className="w-4 h-4" /> :
            <ChevronDown className="w-4 h-4" />;
    };

    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('date')}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                >
                                    Data
                                    <SortIcon field="date" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('description')}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                >
                                    Descrição
                                    <SortIcon field="description" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoria
                            </th>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('amount')}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                >
                                    Valor
                                    <SortIcon field="amount" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('status')}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                >
                                    Status
                                    <SortIcon field="status" />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading ? (
                            Array(10).fill(0).map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={5} className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : sortedTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
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
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => onRowClick?.(tx)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">{formatDate(tx.date)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {tx.type === 'INCOME' ? (
                                                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                                                )}
                                                <span className="text-sm font-medium text-gray-900">{tx.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.category && (
                                                <Badge
                                                    variant="secondary"
                                                    className="category-badge"
                                                >
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
                                            <span className={`text-sm font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.class}`}>
                                                <StatusIcon className="w-3 h-3" />
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
            {
                totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Página {page} de {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onPageChange(page - 1)}
                                disabled={page <= 1}
                                className="px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Página anterior"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onPageChange(page + 1)}
                                disabled={page >= totalPages}
                                className="px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Próxima página"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
