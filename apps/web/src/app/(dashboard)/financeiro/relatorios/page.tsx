'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownRight, Download, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { financeApi } from '@/lib/api/finance';
import { CashFlowChart, DRETable, AgingReport } from '@/components/finance';
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
      return data.projection.map((item) => ({
        date: item.date,
        income: item.inflows,
        expense: item.outflows,
        balance: item.balance,
        projected_income: item.inflows, // Mapping for chart
        projected_expense: item.outflows, // Mapping for chart
        accumulated_balance: item.balance,
      }));
    },
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
          <p className="mt-1 text-gray-500">
            Análise detalhada de fluxo de caixa, resultados e inadimplência
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl border px-4 py-2 transition-colors hover:bg-gray-50"
        >
          <Download className="h-4 w-4 text-gray-600" />
          Exportar
        </button>
      </div>

      {/* Main Content */}
      <Tabs
        defaultValue="overview"
        value={currentTab}
        onValueChange={setCurrentTab}
        className="space-y-6"
      >
        <TabsList className="h-auto flex-wrap rounded-xl border bg-white p-1">
          <TabsTrigger
            value="overview"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="cash-flow"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger
            value="dre"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            DRE Gerencial
          </TabsTrigger>
          <TabsTrigger
            value="aging"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            Contas por Vencimento
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 text-green-600">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Receita Acumulada (Mês)</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(kpis?.total_received || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2 text-red-600">
                  <ArrowDownRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Despesas Acumuladas (Mês)</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(kpis?.total_paid || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Projeção de Saldo (30 dias)</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(
                      cashFlowData[cashFlowData.length - 1]?.accumulated_balance || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Projeção de Fluxo de Caixa (30 dias)
              </h3>
              <button
                onClick={() => setCurrentTab('cash-flow')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Ver Detalhes &rarr;
              </button>
            </div>
            <CashFlowChart data={cashFlowData} isLoading={cfLoading} />
          </div>
        </TabsContent>

        {/* CASH FLOW TAB */}
        <TabsContent value="cash-flow" className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Fluxo de Caixa Projetado</h3>
                <select
                  className="rounded-lg border bg-gray-50 px-3 py-1.5 text-sm"
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
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                DRE Gerencial (Demonstrativo do Resultado)
              </h3>
              <div className="flex gap-2">
                <select
                  className="rounded-lg border px-3 py-1.5 text-sm"
                  value={dreMonth}
                  onChange={(e) => setDreMonth(Number(e.target.value))}
                  aria-label="Selecionar mês"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border px-3 py-1.5 text-sm"
                  value={dreYear}
                  onChange={(e) => setDreYear(Number(e.target.value))}
                  aria-label="Selecionar ano"
                >
                  {[2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DRETable data={dreData} isLoading={dreLoading} />
          </div>
        </TabsContent>

        {/* AGING TAB */}
        <TabsContent value="aging" className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Contas por Faixa de Vencimento
              </h3>
              <div className="flex rounded-lg bg-gray-100 p-1 text-sm">
                <button
                  onClick={() => setAgingType('receivables')}
                  className={`rounded-md px-3 py-1 transition-all ${agingType === 'receivables' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}
                >
                  A Receber
                </button>
                <button
                  onClick={() => setAgingType('payables')}
                  className={`rounded-md px-3 py-1 transition-all ${agingType === 'payables' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}
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
