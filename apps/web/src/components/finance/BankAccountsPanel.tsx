'use client';

import { BankAccount, BankAccountType } from '@/lib/types/finance';
import { Wallet, Plus, Eye, PiggyBank, CreditCard } from 'lucide-react';

interface BankAccountsPanelProps {
  accounts: BankAccount[];
  isLoading?: boolean;
  onAddAccount?: () => void;
  onViewAccount?: (id: string) => void;
}

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Account type icons
const ACCOUNT_ICONS = {
  [BankAccountType.CHECKING]: Wallet,
  [BankAccountType.SAVINGS]: PiggyBank,
  [BankAccountType.INVESTMENT]: CreditCard,
  [BankAccountType.CASH]: Wallet,
  [BankAccountType.CREDIT_CARD]: CreditCard,
};

const ACCOUNT_LABELS = {
  [BankAccountType.CHECKING]: 'Conta Corrente',
  [BankAccountType.SAVINGS]: 'Poupança',
  [BankAccountType.INVESTMENT]: 'Investimento',
  [BankAccountType.CASH]: 'Dinheiro',
  [BankAccountType.CREDIT_CARD]: 'Cartão de Crédito',
};

export function BankAccountsPanel({
  accounts,
  isLoading = false,
  onAddAccount,
  onViewAccount,
}: BankAccountsPanelProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-4">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {/* Header */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Contas Bancárias</h3>
          {onAddAccount && (
            <button
              onClick={onAddAccount}
              className="rounded-lg p-1.5 transition-colors hover:bg-gray-200"
              aria-label="Adicionar conta"
              title="Adicionar conta"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Total Balance */}
      <div className="border-b bg-gradient-to-r from-blue-50 to-blue-100 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">Saldo Total</p>
        <p
          className={`mt-1 text-2xl font-bold ${totalBalance >= 0 ? 'text-blue-700' : 'text-red-600'}`}
        >
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {/* Accounts List */}
      <div className="max-h-80 divide-y overflow-y-auto">
        {accounts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Wallet className="mx-auto mb-2 h-8 w-8 opacity-20" />
            <p className="text-sm">Nenhuma conta cadastrada</p>
          </div>
        ) : (
          accounts.map((account) => {
            const Icon = ACCOUNT_ICONS[account.type] || Wallet;
            const typeLabel = ACCOUNT_LABELS[account.type] || account.type;

            return (
              <div
                key={account.id}
                className="group cursor-pointer p-4 transition-colors hover:bg-gray-50"
                onClick={() => onViewAccount?.(account.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="account-icon rounded-lg p-2">
                    <Icon className="h-5 w-5" />
                    <style jsx>{`
                      .account-icon {
                        background-color: ${account.color || '#3B82F6'}20;
                        color: ${account.color || '#3B82F6'};
                      }
                    `}</style>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{account.name}</p>
                    <p className="text-xs text-gray-500">{typeLabel}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${account.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}
                    >
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                  <button
                    className="rounded-lg p-1.5 opacity-0 transition-all hover:bg-gray-200 group-hover:opacity-100"
                    aria-label="Ver detalhes"
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
