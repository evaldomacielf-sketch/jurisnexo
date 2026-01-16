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
          <div key={i} className="flex animate-pulse items-center space-x-4 rounded-lg border p-4">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="h-3 w-1/4 rounded bg-gray-200"></div>
            </div>
            <div className="h-5 w-24 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.data.map((transaction: any) => (
        <div
          key={transaction.id}
          className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
        >
          <div className="flex items-center space-x-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                transaction.type === TransactionType.INCOME ? 'bg-success-light' : 'bg-error-light'
              }`}
            >
              {transaction.type === TransactionType.INCOME ? (
                <IconArrowUp className="h-5 w-5 text-success" />
              ) : (
                <IconArrowDown className="h-5 w-5 text-error" />
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
                className={`font-semibold ${
                  transaction.type === TransactionType.INCOME ? 'text-success' : 'text-error'
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
            <button className="rounded-lg p-2 hover:bg-gray-100" aria-label="Opções da transação">
              <IconDotsVertical className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
