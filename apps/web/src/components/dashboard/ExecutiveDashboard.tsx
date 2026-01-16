'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BanknotesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalculatorIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis as BarXAxis,
  YAxis as BarYAxis,
} from 'recharts';
import api from '@/lib/api';
import { format } from 'date-fns';

// --- Utility Components ---

const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return 'Aguradando...';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const KPICard = ({ title, value, subtitle, trend, icon: Icon, color }: any) => {
  const colorMap: any = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`rounded-lg p-2 ${colorMap[color] || 'bg-gray-100 text-gray-600'}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="flex items-center text-sm">
          {trend && (
            <span className={`font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'} mr-2`}>
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
          )}
          <span className="text-gray-500">{subtitle}</span>
        </div>
      )}
    </div>
  );
};

// Simple Date Range Picker Stub
const DateRangePicker = ({ value, onChange, className }: any) => (
  <div className={`flex gap-2 ${className}`}>
    <input
      type="date"
      value={format(value.start, 'yyyy-MM-dd')}
      onChange={(e) => onChange({ ...value, start: new Date(e.target.value) })}
      className="rounded border px-2 py-1"
    />
    <span className="self-center">até</span>
    <input
      type="date"
      value={format(value.end, 'yyyy-MM-dd')}
      onChange={(e) => onChange({ ...value, end: new Date(e.target.value) })}
      className="rounded border px-2 py-1"
    />
  </div>
);

const SalesFunnelChart = ({ data }: { data: any }) => {
  if (!data) return <div className="flex h-64 items-center justify-center">Carregando...</div>;

  const funnelData = [
    { name: 'Total Leads', value: data.totalLeads, fill: '#60A5FA' },
    { name: 'Qualificados', value: data.qualified, fill: '#818CF8' },
    { name: 'Contatados', value: data.contacted, fill: '#A78BFA' },
    { name: 'Negociando', value: data.negotiating, fill: '#C084FC' },
    { name: 'Convertidos', value: data.converted, fill: '#34D399' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={funnelData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <BarXAxis type="number" />
        <BarYAxis dataKey="name" type="category" width={100} />
        <Tooltip />
        <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]} label={{ position: 'right' }}>
          {funnelData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ExecutiveDashboard() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of month
    end: new Date(),
  });

  // Format dates for API
  const queryParams = {
    startDate: format(dateRange.start, 'yyyy-MM-dd'),
    endDate: format(dateRange.end, 'yyyy-MM-dd'),
  };

  const { data: financialKPIs } = useQuery({
    queryKey: ['financial-kpis', queryParams],
    queryFn: () =>
      api.get('/dashboard/executive/financial', { params: queryParams }).then((res) => res.data),
  });

  const { data: operationalKPIs } = useQuery({
    queryKey: ['operational-kpis', queryParams],
    queryFn: () =>
      api.get('/dashboard/executive/operational', { params: queryParams }).then((res) => res.data),
  });

  const { data: salesKPIs } = useQuery({
    queryKey: ['sales-kpis', queryParams],
    queryFn: () =>
      api.get('/dashboard/executive/sales', { params: queryParams }).then((res) => res.data),
  });

  const { data: monthlyRevenue } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: () => api.get('/dashboard/executive/monthly-revenue').then((res) => res.data),
  });

  const { data: revenueByArea } = useQuery({
    queryKey: ['revenue-by-area', queryParams],
    queryFn: () =>
      api
        .get('/dashboard/executive/revenue-by-area', { params: queryParams })
        .then((res) => res.data),
  });

  const { data: salesFunnel } = useQuery({
    queryKey: ['sales-funnel', queryParams],
    queryFn: () =>
      api.get('/dashboard/executive/sales-funnel', { params: queryParams }).then((res) => res.data),
  });

  const exportToPDF = () => {
    alert('Funcionalidade de Exportação será implementada em breve.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-600">Visão estratégica do negócio</p>
        </div>

        <div className="flex items-center gap-4">
          <DateRangePicker value={dateRange} onChange={setDateRange} className="" />

          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards - Financeiro */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">💰 Indicadores Financeiros</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Receita Total"
            value={formatCurrency(financialKPIs?.totalRevenue)}
            trend={financialKPIs?.revenueGrowth}
            icon={BanknotesIcon}
            color="green"
          />
          <KPICard
            title="Lucro Líquido"
            value={formatCurrency(financialKPIs?.netProfit)}
            subtitle={`Margem: ${financialKPIs?.netMargin?.toFixed(1)}%`}
            trend={financialKPIs?.profitGrowth}
            icon={ChartBarIcon}
            color="blue"
          />
          <KPICard
            title="MRR"
            value={formatCurrency(financialKPIs?.mrr)}
            subtitle={`ARR: ${formatCurrency(financialKPIs?.arr)}`}
            trend={financialKPIs?.mrrGrowth}
            icon={ArrowTrendingUpIcon}
            color="purple"
          />
          <KPICard
            title="LTV / CAC"
            value={financialKPIs?.ltvCacRatio?.toFixed(2) || '-'}
            subtitle={`CAC: ${formatCurrency(financialKPIs?.cac)}`}
            icon={CalculatorIcon}
            color="orange"
          />
        </div>
      </div>

      {/* Gráfico de Receita Mensal */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Receita vs Despesas (12 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                name="Receita"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                name="Despesas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Receita por Área do Direito */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Receita por Área do Direito</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByArea}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ area, percent }: any) => `${area} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {revenueByArea?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Cards - Operacional */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">⚙️ Indicadores Operacionais</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <KPICard
            title="Processos Ativos"
            value={operationalKPIs?.activeCases}
            subtitle={`+${operationalKPIs?.newCases || 0} novos`}
            icon={DocumentTextIcon}
            color="blue"
          />
          <KPICard
            title="Clientes Ativos"
            value={operationalKPIs?.activeClients}
            subtitle={`+${operationalKPIs?.newClients || 0} novos`}
            icon={UsersIcon}
            color="purple"
          />
          <KPICard
            title="Tempo de Resposta"
            value={`${operationalKPIs?.avgResponseTimeMinutes || 0} min`}
            icon={ClockIcon}
            color="yellow"
          />
          <KPICard
            title="Conversão de Leads"
            value={`${operationalKPIs?.leadConversionRate?.toFixed(1) || 0}%`}
            subtitle={`${operationalKPIs?.convertedLeads || 0} convertidos`}
            icon={ChartPieIcon}
            color="green"
          />
          <KPICard
            title="SLA Compliance"
            value={`${operationalKPIs?.slaCompliance?.toFixed(1) || 0}%`}
            subtitle={`${operationalKPIs?.slaBreaches || 0} quebras`}
            icon={ShieldCheckIcon}
            color={operationalKPIs?.slaCompliance >= 95 ? 'green' : 'red'}
          />
        </div>
      </div>

      {/* Funil de Vendas */}
      <div className="mb-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">🎯 Funil de Vendas</h3>
          <SalesFunnelChart data={salesFunnel} />
        </div>
      </div>

      {/* Top Performers */}
      <div className="mb-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            🏆 Top Performers (Advogados)
          </h3>
          <div className="space-y-3">
            {salesKPIs?.topPerformers?.map((performer: any, index: number) => (
              <div
                key={performer.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  {/* Avatar Stub */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 font-bold text-gray-600">
                    {performer.name?.substring(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">{performer.name}</h4>
                    <p className="text-sm text-gray-600">
                      {performer.casesWon} casos • {performer.conversionRate?.toFixed(1)}% conversão
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(performer.revenue)}
                  </p>
                  <p className="text-sm text-gray-600">receita gerada</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
