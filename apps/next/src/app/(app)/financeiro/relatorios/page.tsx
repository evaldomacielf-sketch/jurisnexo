'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowUpRight,
    ArrowDownRight,
    Download,
    TrendingUp
} from 'lucide-react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { financeApi } from '@/lib/api/finance';
import {
    CashFlowChart,
    DRETable,
    AgingReport
} from '@/components/finance';
import { formatCurrency } from '@/utils/format';

export default function ReportsPage() {
    const [currentTab, setCurrentTab] = useState('overview');
    const [dateRange, setDateRange] = useState('30'); // Days for cash flow

    // --- QUERIES ---

    // 1. Dashboard KPIs (used for Overview)
    const { data: kpis } = useQuery({
        queryKey: ['finance', 'reports', 'kpis'],
        queryFn: () => financeApi.getDashboardKPIs(),
        staleTime: 60000,
    });

    // 2. Cash Flow Projection
    const { data: cashFlowData = [], isLoading: cfLoading } = useQuery({
        queryKey: ['finance', 'reports', 'cash-flow', dateRange],
        queryFn: () => financeApi.getCashFlowProjection(Number(dateRange)),
        enabled: currentTab === 'cash-flow' || currentTab === 'overview',
        select: (data) => {
            return data.projection.map(item => ({
                date: item.date,
                income: item.inflows,
                expense: item.outflows,
                balance: item.balance,
                projected_income: item.inflows, // Mapping for chart
                projected_expense: item.outflows, // Mapping for chart
                accumulated_balance: item.balance
            }));
        }
    });

    // 3. DRE (Monthly Summary) - Default to current month/year for now
    const now = new Date();
    const [dreYear, setDreYear] = useState(now.getFullYear());
    const [dreMonth, setDreMonth] = useState(now.getMonth() + 1);

    const { data: dreData, isLoading: dreLoading } = useQuery({
        queryKey: ['finance', 'reports', 'dre', dreYear, dreMonth],
        queryFn: () => financeApi.getMonthlySummary(dreYear, dreMonth),
        enabled: currentTab === 'dre',
    });

    // 4. Aging Report
    const [agingType, setAgingType] = useState<'receivables' | 'payables'>('receivables');
    const { data: agingData, isLoading: agingLoading } = useQuery({
        queryKey: ['finance', 'reports', 'aging', agingType],
        queryFn: () => financeApi.getAgingReport(agingType),
        enabled: currentTab === 'aging',
    });

    const handleExport = () => {
        // Implement export logic (CSV/PDF) later
        alert('Funcionalidade de exportação em breve!');
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
                    <p className="text-gray-500 mt-1">Análise detalhada de fluxo de caixa, resultados e inadimplência</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <Download className="w-4 h-4 text-gray-600" />
                    Exportar
                </button>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-xl h-auto flex-wrap">
                    <TabsTrigger value="overview" className="px-4 py-2 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                        Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="cash-flow" className="px-4 py-2 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                        Fluxo de Caixa
                    </TabsTrigger>
                    <TabsTrigger value="dre" className="px-4 py-2 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                        DRE Gerencial
                    </TabsTrigger>
                    <TabsTrigger value="aging" className="px-4 py-2 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                        Contas por Vencimento
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Receita Acumulada (Mês)</p>
                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(kpis?.total_received || 0)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                    <ArrowDownRight className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Despesas Acumuladas (Mês)</p>
                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(kpis?.total_paid || 0)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Projeção de Saldo (30 dias)</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {formatCurrency(cashFlowData[cashFlowData.length - 1]?.accumulated_balance || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Projeção de Fluxo de Caixa (30 dias)</h3>
                            <button
                                onClick={() => setCurrentTab('cash-flow')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Ver Detalhes &rarr;
                            </button>
                        </div>
                        <CashFlowChart data={cashFlowData} isLoading={cfLoading} />
                    </div>
                </TabsContent>

                {/* CASH FLOW TAB */}
                <TabsContent value="cash-flow" className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-900">Fluxo de Caixa Projetado</h3>
                                <select
                                    className="px-3 py-1.5 border rounded-lg text-sm bg-gray-50"
                                    value={dateRange}
                                    title="Período de projeção"
                                    onChange={(e) => setDateRange(e.target.value)}
                                >
                                    <option value="15">Próximos 15 dias</option>
                                    <option value="30">Próximos 30 dias</option>
                                    <option value="60">Próximos 60 dias</option>
                                    <option value="90">Próximos 90 dias</option>
                                </select>
                            </div>
                        </div>
                        <CashFlowChart data={cashFlowData} isLoading={cfLoading} />
                    </div>
                </TabsContent>

                {/* DRE TAB */}
                <TabsContent value="dre" className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">DRE Gerencial (Demonstrativo do Resultado)</h3>
                            <div className="flex gap-2">
                                <select
                                    className="px-3 py-1.5 border rounded-lg text-sm"
                                    value={dreMonth}
                                    onChange={(e) => setDreMonth(Number(e.target.value))}
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}</option>
                                    ))}
                                </select>
                                <select
                                    className="px-3 py-1.5 border rounded-lg text-sm"
                                    value={dreYear}
                                    onChange={(e) => setDreYear(Number(e.target.value))}
                                >
                                    {[2024, 2025, 2026].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <DRETable data={dreData} isLoading={dreLoading} />
                    </div>
                </TabsContent>

                {/* AGING TAB */}
                <TabsContent value="aging" className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Contas por Faixa de Vencimento</h3>
                            <div className="bg-gray-100 p-1 rounded-lg flex text-sm">
                                <button
                                    onClick={() => setAgingType('receivables')}
                                    className={`px-3 py-1 rounded-md transition-all ${agingType === 'receivables' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                                >
                                    A Receber
                                </button>
                                <button
                                    onClick={() => setAgingType('payables')}
                                    className={`px-3 py-1 rounded-md transition-all ${agingType === 'payables' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                                >
                                    A Pagar
                                </button>
                            </div>
                        </div>
                        <AgingReport data={agingData} type={agingType} isLoading={agingLoading} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
