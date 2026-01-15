'use client';

import { useMemo } from 'react';

interface ChartData {
    category: string;
    income: number;
    expense: number;
    color?: string;
}

interface RevenueExpenseChartProps {
    data: ChartData[];
    isLoading?: boolean;
}

// Format currency
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
    }).format(value);
}

// Colors for categories
const CATEGORY_COLORS = [
    '#3B82F6', // blue
    '#22C55E', // green
    '#EF4444', // red
    '#F59E0B', // amber
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
];

export function RevenueExpenseChart({ data, isLoading = false }: RevenueExpenseChartProps) {
    const { maxValue, totalIncome, totalExpense } = useMemo(() => {
        const allValues = data.flatMap(d => [d.income, d.expense]);
        const max = Math.max(...allValues, 1);
        const income = data.reduce((sum, d) => sum + d.income, 0);
        const expense = data.reduce((sum, d) => sum + d.expense, 0);
        return { maxValue: max, totalIncome: income, totalExpense: expense };
    }, [data]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border p-6">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6" />
                <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="flex-1 h-8 bg-gray-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Receitas x Despesas por Categoria</h2>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-gray-600">Receitas: {formatCurrency(totalIncome)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-gray-600">Despesas: {formatCurrency(totalExpense)}</span>
                    </div>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>Nenhum dado disponível</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((item, index) => {
                        const incomeWidth = (item.income / maxValue) * 100;
                        const expenseWidth = (item.expense / maxValue) * 100;
                        const color = item.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length];

                        return (
                            <div key={item.category} className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                        {item.category}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatCurrency(item.income)} / {formatCurrency(item.expense)}
                                    </span>
                                </div>
                                <div className="flex gap-1 h-8">
                                    {/* Income bar */}
                                    <div
                                        className="h-full bg-green-500 rounded-l transition-all duration-500 ease-out group-hover:opacity-80"
                                        style={{
                                            width: `${incomeWidth}%`,
                                            minWidth: item.income > 0 ? '4px' : '0',
                                        }}
                                    />
                                    {/* Expense bar */}
                                    <div
                                        className="h-full bg-red-500 rounded-r transition-all duration-500 ease-out group-hover:opacity-80"
                                        style={{
                                            width: `${expenseWidth}%`,
                                            minWidth: item.expense > 0 ? '4px' : '0',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
