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

export function RevenueExpenseChart({ data, isLoading = false }: RevenueExpenseChartProps) {
  const { maxValue, totalIncome, totalExpense } = useMemo(() => {
    const allValues = data.flatMap((d) => [d.income, d.expense]);
    const max = Math.max(...allValues, 1);
    const income = data.reduce((sum, d) => sum + d.income, 0);
    const expense = data.reduce((sum, d) => sum + d.expense, 0);
    return { maxValue: max, totalIncome: income, totalExpense: expense };
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <div className="mb-6 h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-8 flex-1 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Receitas x Despesas por Categoria</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Receitas: {formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-gray-600">Despesas: {formatCurrency(totalExpense)}</span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <p>Nenhum dado disponível</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => {
            const incomeWidth = (item.income / maxValue) * 100;
            const expenseWidth = (item.expense / maxValue) * 100;
            const incomeMinWidth = item.income > 0 ? '4px' : '0';
            const expenseMinWidth = item.expense > 0 ? '4px' : '0';

            return (
              <div key={item.category} className="group">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-gray-900">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(item.income)} / {formatCurrency(item.expense)}
                  </span>
                </div>
                <div className="flex h-8 gap-1">
                  {/* Income bar */}
                  <div className="income-bar h-full rounded-l bg-green-500 transition-all duration-500 ease-out group-hover:opacity-80" />
                  <style jsx>{`
                    .income-bar {
                      width: ${incomeWidth}%;
                      min-width: ${incomeMinWidth};
                    }
                  `}</style>
                  {/* Expense bar */}
                  <div className="expense-bar h-full rounded-r bg-red-500 transition-all duration-500 ease-out group-hover:opacity-80" />
                  <style jsx>{`
                    .expense-bar {
                      width: ${expenseWidth}%;
                      min-width: ${expenseMinWidth};
                    }
                  `}</style>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
