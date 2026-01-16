'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

interface CategoryData {
  category: string;
  total: number;
  color?: string;
}

interface CategoryChartProps {
  data: CategoryData[];
  loading?: boolean;
}

export function CategoryChart({ data, loading }: CategoryChartProps) {
  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
        Sem dados para exibir
      </div>
    );
  }

  // Sort by total desc and take top 5
  const chartData = [...data].sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="category"
            type="category"
            width={100}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
            }
            cursor={{ fill: 'transparent' }}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={32}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
