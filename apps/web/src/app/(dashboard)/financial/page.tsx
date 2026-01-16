'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  IconArrowLeft,
  IconArrowRight,
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconPlus,
} from '@tabler/icons-react';
import { useMonthlyStats, useTransactionsByCategory } from '@/hooks/use-transactions';
import { useConsolidatedBalance } from '@/hooks/use-bank-accounts';
import { StatCard } from '@/components/financial/stat-card';
import { MonthlyChart } from '@/components/financial/monthly-chart';
import { CategoryChart } from '@/components/financial/category-chart';
import { TransactionList } from '@/components/financial/transaction-list';
import { TransactionModal } from '@/components/financial/transaction-modal';

export default function FinancialDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

  const { data: monthlyStats, isLoading: statsLoading } = useMonthlyStats(year, month);
  const { data: balanceData, isLoading: balanceLoading } = useConsolidatedBalance();
  const { data: categoryData, isLoading: categoryLoading } = useTransactionsByCategory(
    startDate,
    endDate
  );

  const previousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="container-custom space-y-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="mt-1 text-gray-600">Gestão financeira do escritório</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <IconPlus className="mr-2 h-4 w-4" />
          Nova Transação
        </button>
      </div>

      {/* Month Navigator */}
      <div className="card-financial flex items-center justify-between">
        <button
          onClick={previousMonth}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          aria-label="Mês anterior"
        >
          <IconArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          aria-label="Próximo mês"
        >
          <IconArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(monthlyStats?.income || 0)}
          icon={<IconTrendingUp className="h-8 w-8 text-success" />}
          trend={'+12.5%'}
          loading={statsLoading}
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(monthlyStats?.expenses || 0)}
          icon={<IconTrendingDown className="h-8 w-8 text-error" />}
          trend={'-8.2%'}
          loading={statsLoading}
        />
        <StatCard
          title="Saldo do Mês"
          value={formatCurrency(monthlyStats?.balance || 0)}
          icon={<IconWallet className="h-8 w-8 text-primary" />}
          trend={monthlyStats?.balance && monthlyStats.balance > 0 ? '+' : '-'}
          loading={statsLoading}
        />
        <StatCard
          title="Saldo Total"
          value={formatCurrency(balanceData?.total || 0)}
          icon={<IconWallet className="h-8 w-8 text-primary" />}
          loading={balanceLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-financial">
          <h3 className="mb-4 text-lg font-semibold">Receitas vs Despesas</h3>
          <MonthlyChart income={monthlyStats?.income || 0} expenses={monthlyStats?.expenses || 0} />
        </div>
        <div className="card-financial">
          <h3 className="mb-4 text-lg font-semibold">Por Categoria</h3>
          <CategoryChart data={categoryData || []} loading={categoryLoading} />
        </div>
      </div>

      {/* Transaction List */}
      <div className="card-financial">
        <h3 className="mb-4 text-lg font-semibold">Transações Recentes</h3>
        <TransactionList filters={{ start_date: startDate, end_date: endDate }} />
      </div>

      {/* Transaction Modal */}
      <TransactionModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
