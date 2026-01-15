'use client';

import {
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: number;
    previousValue?: number;
    type: 'income' | 'expense' | 'balance' | 'overdue';
    isLoading?: boolean;
}

// Format currency
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

// Calculate percentage change
function calculateChange(current: number, previous: number): { value: number; direction: 'up' | 'down' | 'neutral' } {
    if (previous === 0) return { value: 0, direction: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    return {
        value: Math.abs(change),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
}

function SummaryCard({ title, value, previousValue, type, isLoading }: SummaryCardProps) {
    const change = previousValue !== undefined ? calculateChange(value, previousValue) : null;

    const configs = {
        income: {
            icon: TrendingUp,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            iconBg: 'bg-green-100',
            borderColor: 'border-green-200',
        },
        expense: {
            icon: TrendingDown,
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            iconBg: 'bg-red-100',
            borderColor: 'border-red-200',
        },
        balance: {
            icon: Wallet,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            iconBg: 'bg-blue-100',
            borderColor: 'border-blue-200',
        },
        overdue: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            iconBg: 'bg-yellow-100',
            borderColor: 'border-yellow-200',
        },
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <div className={`rounded-xl border p-6 ${config.bgColor} ${config.borderColor} transition-all hover:shadow-lg hover:scale-[1.02] duration-300`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className={`text-sm font-medium ${config.textColor} opacity-80`}>{title}</p>
                    {isLoading ? (
                        <div className="h-8 w-32 bg-current opacity-20 rounded animate-pulse mt-2" />
                    ) : (
                        <p className={`text-2xl font-bold mt-2 ${config.textColor} animate-in fade-in duration-500`}>
                            {formatCurrency(value)}
                        </p>
                    )}
                    {change && !isLoading && (
                        <div className="flex items-center gap-1 mt-2 animate-in slide-in-from-bottom duration-300">
                            {change.direction === 'up' ? (
                                <ArrowUpRight className={`w-4 h-4 ${type === 'expense' ? 'text-red-500' : 'text-green-500'}`} />
                            ) : change.direction === 'down' ? (
                                <ArrowDownRight className={`w-4 h-4 ${type === 'expense' ? 'text-green-500' : 'text-red-500'}`} />
                            ) : null}
                            <span className={`text-sm font-medium ${change.direction === 'up'
                                    ? type === 'expense' ? 'text-red-500' : 'text-green-500'
                                    : change.direction === 'down'
                                        ? type === 'expense' ? 'text-green-500' : 'text-red-500'
                                        : 'text-gray-500'
                                }`}>
                                {change.value.toFixed(1)}% vs mês anterior
                            </span>
                        </div>
                    )}
                </div>
                <div className={`p-4 rounded-xl ${config.iconBg} transition-transform hover:rotate-12 duration-300`}>
                    <Icon className={`w-8 h-8 ${config.textColor}`} />
                </div>
            </div>
        </div>
    );
}

interface FinancialSummaryCardsProps {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    overdueAmount: number;
    previousIncome?: number;
    previousExpense?: number;
    previousBalance?: number;
    isLoading?: boolean;
}

export function FinancialSummaryCards({
    totalIncome,
    totalExpense,
    balance,
    overdueAmount,
    previousIncome,
    previousExpense,
    previousBalance,
    isLoading = false,
}: FinancialSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
                title="Receitas"
                value={totalIncome}
                previousValue={previousIncome}
                type="income"
                isLoading={isLoading}
            />
            <SummaryCard
                title="Despesas"
                value={totalExpense}
                previousValue={previousExpense}
                type="expense"
                isLoading={isLoading}
            />
            <SummaryCard
                title="Saldo"
                value={balance}
                previousValue={previousBalance}
                type="balance"
                isLoading={isLoading}
            />
            <SummaryCard
                title="Vencidas"
                value={overdueAmount}
                type="overdue"
                isLoading={isLoading}
            />
        </div>
    );
}
