'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/utils/format';

interface AgingItem {
  range: string;
  amount: number;
  count: number;
  label: string;
  color: string;
}

interface AgingReportProps {
  data: any; // Type from API
  type: 'receivables' | 'payables';
  isLoading: boolean;
}

export function AgingReport({ data, type, isLoading }: AgingReportProps) {
  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-lg bg-gray-100" />;
  }

  // Default structure if data is empty or loading
  // Adjust based on typical buckets: 1-30, 31-60...
  const ranges: AgingItem[] = [
    {
      range: '0-30',
      label: 'Até 30 dias',
      amount: data?.buckets?.['1-30'] || 0,
      count: 0,
      color: 'bg-green-100 text-green-800',
    },
    {
      range: '31-60',
      label: '31 a 60 dias',
      amount: data?.buckets?.['31-60'] || 0,
      count: 0,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      range: '61-90',
      label: '61 a 90 dias',
      amount: data?.buckets?.['61-90'] || 0,
      count: 0,
      color: 'bg-orange-100 text-orange-800',
    },
    {
      range: '90+',
      label: 'Mais de 90 dias',
      amount: data?.buckets?.['90+'] || 0,
      count: 0,
      color: 'bg-red-100 text-red-800',
    },
  ];

  const totalAmount = ranges.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Cards Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {ranges.map((item) => (
          <div key={item.range} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-gray-500">{item.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${item.color}`}>
                {item.count} títulos
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(item.amount)}</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`bucket-width h-full ${item.color.split(' ')[0].replace('bg-', 'bg-')}`}
              />
              <style jsx>{`
                .bucket-width {
                  width: ${totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0}%;
                }
              `}</style>
              <style jsx>{`
                div {
                  --bucket-width: ${totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0}%;
                }
              `}</style>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900">Detalhamento Simplificado</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Faixa de Atraso</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">% do Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranges.map((item) => (
              <TableRow key={item.range}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${item.color.split(' ')[0]}`} />
                    {item.label}
                  </div>
                </TableCell>
                <TableCell className="text-right">{item.count}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(item.amount)}
                </TableCell>
                <TableCell className="text-right text-gray-500">
                  {totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(1) : 0}%
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-50 font-bold">
              <TableCell>Total Geral</TableCell>
              <TableCell className="text-right">
                {ranges.reduce((acc, i) => acc + i.count, 0)}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(totalAmount)}</TableCell>
              <TableCell className="text-right">100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
