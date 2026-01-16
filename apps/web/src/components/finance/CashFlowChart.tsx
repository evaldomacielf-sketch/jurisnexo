'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/utils/format';

type CashFlowData = {
  date: string;
  income: number;
  expense: number;
  balance: number;
  projected_income: number;
  projected_expense: number;
  accumulated_balance: number;
};

interface CashFlowChartProps {
  data: CashFlowData[];
  isLoading?: boolean;
}

export function CashFlowChart({ data, isLoading }: CashFlowChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      }),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full animate-pulse items-center justify-center rounded-xl bg-gray-50">
        <span className="text-gray-400">Carregando projeção...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
        <div className="text-center text-gray-400">
          <p>Sem dados suficientes para projeção</p>
          <p className="text-sm">Registre transações futuras para visualizar o fluxo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="formattedDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={(value) => `R$ ${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: number) => [formatCurrency(value), ''] as [string, string]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="balance"
            name="Saldo Acumulado"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorBalance)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Entradas Previstas"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorIncome)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Saídas Previstas"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorExpense)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
