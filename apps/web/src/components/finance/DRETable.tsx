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
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DRERow {
    id: string;
    label: string;
    value: number;
    level: 1 | 2 | 3;
    type: 'income' | 'expense' | 'result';
    children?: DRERow[];
}

interface DRETableProps {
    data: any; // We'll type this properly based on the API response structure
    isLoading: boolean;
}

// Recursive row component
function DRERowItem({ row, defaultExpanded = true }: { row: DRERow; defaultExpanded?: boolean }) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const hasChildren = row.children && row.children.length > 0;

    const valueColor = row.type === 'expense'
        ? 'text-red-600'
        : row.type === 'result' && row.value < 0
            ? 'text-red-600'
            : row.type === 'result'
                ? 'text-green-600'
                : 'text-gray-900';

    return (
        <>
            <TableRow className={cn(
                row.level === 1 && "bg-gray-50 font-semibold",
                row.level === 2 && "bg-white",
                "hover:bg-gray-50/80 transition-colors"
            )}>
                <TableCell className="py-3">
                    <div
                        className="flex items-center gap-2 cursor-pointer select-none row-padding"
                        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
                    >
                        <style jsx>{`
                            .row-padding {
                                padding-left: ${(row.level - 1) * 1.5}rem;
                            }
                        `}</style>
                        {hasChildren ? (
                            isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
                        ) : (
                            <div className="w-4 h-4" /> // Spacer
                        )}
                        <span className={cn(
                            row.level === 1 && "text-base",
                            row.level === 2 && "text-sm",
                            row.level === 3 && "text-sm text-gray-500"
                        )}>
                            {row.label}
                        </span>
                    </div>
                </TableCell>
                <TableCell className={cn("text-right font-medium", valueColor)}>
                    {row.type === 'expense' && row.value > 0 ? '-' : ''}
                    {formatCurrency(Math.abs(row.value))}
                </TableCell>
                <TableCell className="text-right text-gray-500 text-sm w-[100px]">
                    {/* Placeholder for vertical analysis % */}
                    -
                </TableCell>
            </TableRow>
            {hasChildren && isExpanded && row.children?.map((child) => (
                <DRERowItem key={child.id} row={child} defaultExpanded={false} />
            ))}
        </>
    );
}

export function DRETable({ data, isLoading }: DRETableProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    // Mock data transformation - pending API alignment
    // This assumes `data` structure from backend or maps it here
    const processedData: DRERow[] = [
        {
            id: 'gross_revenue',
            label: 'Receita Bruta',
            value: data?.revenue || 0,
            level: 1,
            type: 'income',
            children: [
                { id: 'services', label: 'Honorários', value: (data?.revenue || 0) * 0.9, level: 2, type: 'income' },
                { id: 'other_rev', label: 'Outras Receitas', value: (data?.revenue || 0) * 0.1, level: 2, type: 'income' },
            ]
        },
        {
            id: 'deductions',
            label: 'Deduções',
            value: 0,
            level: 1,
            type: 'expense',
            children: []
        },
        {
            id: 'net_revenue',
            label: 'Receita Líquida',
            value: data?.revenue || 0,
            level: 1,
            type: 'result',
        },
        {
            id: 'expenses',
            label: 'Despesas Operacionais',
            value: data?.expenses || 0,
            level: 1,
            type: 'expense',
            children: data?.categories?.map((cat: any) => ({
                id: cat.id,
                label: cat.name,
                value: cat.total,
                level: 2,
                type: 'expense'
            })) || []
        },
        {
            id: 'result',
            label: 'Resultado (Lucro/Prejuízo)',
            value: data?.profit || 0,
            level: 1,
            type: 'result',
        }
    ];

    return (
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="w-[60%]">Conta</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">AV %</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {processedData.map((row) => (
                        <DRERowItem key={row.id} row={row} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
