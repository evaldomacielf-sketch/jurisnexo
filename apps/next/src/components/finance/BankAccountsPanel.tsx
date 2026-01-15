'use client';

import { Wallet, Plus, Eye, PiggyBank, CreditCard } from 'lucide-react';

interface BankAccount {
    id: string;
    name: string;
    type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CASH';
    balance: number;
    color?: string;
}

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
    CHECKING: Wallet,
    SAVINGS: PiggyBank,
    INVESTMENT: CreditCard,
    CASH: Wallet,
};

const ACCOUNT_LABELS = {
    CHECKING: 'Conta Corrente',
    SAVINGS: 'Poupança',
    INVESTMENT: 'Investimento',
    CASH: 'Dinheiro',
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
            <div className="bg-white rounded-xl border p-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Contas Bancárias</h3>
                    {onAddAccount && (
                        <button
                            onClick={onAddAccount}
                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                            aria-label="Adicionar conta"
                            title="Adicionar conta"
                        >
                            <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                    )}
                </div>
            </div>

            {/* Total Balance */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Saldo Total</p>
                <p className={`text-2xl font-bold mt-1 ${totalBalance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                    {formatCurrency(totalBalance)}
                </p>
            </div>

            {/* Accounts List */}
            <div className="divide-y max-h-80 overflow-y-auto">
                {accounts.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        <Wallet className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Nenhuma conta cadastrada</p>
                    </div>
                ) : (
                    accounts.map((account) => {
                        const Icon = ACCOUNT_ICONS[account.type] || Wallet;
                        const typeLabel = ACCOUNT_LABELS[account.type] || account.type;

                        return (
                            <div
                                key={account.id}
                                className="p-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                                onClick={() => onViewAccount?.(account.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{ backgroundColor: `${account.color || '#3B82F6'}20` }}
                                    >
                                        <Icon
                                            className="w-5 h-5"
                                            style={{ color: account.color || '#3B82F6' }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{account.name}</p>
                                        <p className="text-xs text-gray-500">{typeLabel}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${account.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                            {formatCurrency(account.balance)}
                                        </p>
                                    </div>
                                    <button
                                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-lg transition-all"
                                        aria-label="Ver detalhes"
                                        title="Ver detalhes"
                                    >
                                        <Eye className="w-4 h-4 text-gray-500" />
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
