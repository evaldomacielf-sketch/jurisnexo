'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IconArrowUp, IconArrowDown, IconDotsVertical } from '@tabler/icons-react';
import { useTransactions } from '@/hooks/use-transactions';
import { TransactionFilters, TransactionType } from '@/types/financial';

interface TransactionListProps {
    filters?: TransactionFilters;
}

export function TransactionList({ filters }: TransactionListProps) {
    const { data, isLoading } = useTransactions(filters);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data?.data || data.data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Nenhuma transação encontrada</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {data.data.map((transaction: any) => (
                <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                >
                    <div className="flex items-center space-x-4">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === TransactionType.INCOME
                                ? 'bg-success-light'
                                : 'bg-error-light'
                                }`}
                        >
                            {transaction.type === TransactionType.INCOME ? (
                                <IconArrowUp className="w-5 h-5 text-success" />
                            ) : (
                                <IconArrowDown className="w-5 h-5 text-error" />
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                                {transaction.category?.name} · {transaction.bank_account?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p
                                className={`font-semibold ${transaction.type === TransactionType.INCOME
                                    ? 'text-success'
                                    : 'text-error'
                                    }`}
                            >
                                {transaction.type === TransactionType.INCOME ? '+' : '-'}{' '}
                                {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {format(new Date(transaction.transaction_date), 'dd MMM yyyy', {
                                    locale: ptBR,
                                })}
                            </p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Opções da transação">
                            <IconDotsVertical className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
