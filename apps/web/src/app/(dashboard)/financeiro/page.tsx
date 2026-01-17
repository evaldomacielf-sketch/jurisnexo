'use client';

import { useState, useMemo, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { financeiroApi as financeApi } from '@/services/api/financeiro.service';
import { FinancialSummaryCards } from '@/components/finance/FinancialSummaryCards';
import { RevenueExpenseChart } from '@/components/finance/RevenueExpenseChart';
import { FilterBar } from '@/components/finance/FilterBar';
import { TransactionTable } from '@/components/finance/TransactionTable';
import { BankAccountsPanel } from '@/components/finance/BankAccountsPanel';
import CreateTransactionModal from '@/components/finance/CreateTransactionModal';

// Simple fallback component
function FinanceLoading() {
  return (
    <div className="space-y-4">
      <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  );
}

// Helper to avoid name collision error if logic stays same
function androidMonthName(month: number): string {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return months[month - 1] || 'Mês Inválido';
}

export default function FinanceDashboard() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Calculate start/end dates for the selected month (for generic filtering)
  const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

  // --- QUERIES ---

  // 1. Dashboard KPIs
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['finance', 'kpis'],
    queryFn: () => (financeApi as any).getDashboardKPIs?.() || Promise.resolve({}),
    staleTime: 60000,
  });

  // 2. Monthly Summary
  const { data: monthlySummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['finance', 'monthly', currentYear, currentMonth],
    queryFn: () => (financeApi as any).getMonthlySummary?.(currentYear, currentMonth) || Promise.resolve({}),
    staleTime: 60000,
  });

  // 3. Previous Month for Comparison
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const { data: prevMonthlySummary } = useQuery({
    queryKey: ['finance', 'monthly', prevYear, prevMonth],
    queryFn: () => (financeApi as any).getMonthlySummary?.(prevYear, prevMonth) || Promise.resolve({}),
    staleTime: 60000,
  });

  // 4. Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['finance', 'categories'],
    queryFn: () => (financeApi as any).getCategories?.() || Promise.resolve([]),
    staleTime: 300000, // 5 minutes
  });

  // 5. Bank Accounts
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['finance', 'accounts'],
    queryFn: () => (financeApi as any).getBankAccounts?.() || Promise.resolve([]),
    staleTime: 60000,
  });

  // 6. Transactions (Unified List)
  const { data: transactionsData, isLoading: txLoading } = useQuery({
    queryKey: ['finance', 'transactions', page, filters, currentYear, currentMonth],
    queryFn: () => {
      const apiFilters: any = { ...filters };
      if (apiFilters.status === 'ALL') delete apiFilters.status;
      if (apiFilters.type === 'ALL') delete apiFilters.type;

      // Check if getTransactions exists, otherwise mock or error gracefully
      if ((financeApi as any).getTransactions) {
        return (financeApi as any).getTransactions({
          page,
          limit: 10,
          ...apiFilters,
          due_date_from: filters.date_from || startDate,
          due_date_to: filters.date_to || endDate,
        });
      }
      return Promise.resolve({ data: [], pagination: { totalPages: 1 } });
    },
    placeholderData: (previousData) => previousData,
  });

  // 7. Category Stats (for Chart)
  const { data: categoryStats = [], isLoading: chartLoading } = useQuery({
    queryKey: ['finance', 'stats', 'categories', currentYear, currentMonth],
    queryFn: () => (financeApi as any).getCategoryStats?.(startDate, endDate) || Promise.resolve([]),
    staleTime: 60000,
  });

  // Transform Category Stats for Chart
  const chartData = useMemo(() => {
    return (categoryStats || []).map((stat: any) => ({
      category: stat.category?.name || 'Sem Categoria',
      income: stat.type === 'INCOME' ? Number(stat.total) : 0,
      expense: stat.type === 'EXPENSE' ? Number(stat.total) : 0,
    }));
  }, [categoryStats]);

  // Handle create transaction
  const handleCreateTransaction = async (data: any) => {
    try {
      if (data.type === 'INCOME') {
        if ((financeApi as any).createReceivable) {
          await (financeApi as any).createReceivable(data);
        }
      } else {
        if ((financeApi as any).createPayable) {
          await (financeApi as any).createPayable(data);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Erro ao criar transação');
    }
  };

  const isLoading = kpisLoading || summaryLoading || txLoading || chartLoading;

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6">
      {/* Header with Month Navigation */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <p className="mt-1 text-gray-500">Gerencie as finanças do escritório</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm">
            <button
              onClick={() => navigateMonth(-1)}
              className="rounded-lg p-1 transition-colors hover:bg-gray-100"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="min-w-[140px] text-center font-semibold capitalize text-gray-900">
              {androidMonthName(currentMonth)} {currentYear}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="rounded-lg p-1 transition-colors hover:bg-gray-100"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['finance'] })}
            className="rounded-xl border bg-white p-2.5 shadow-sm transition-colors hover:bg-gray-50"
            aria-label="Atualizar dados"
            title="Atualizar"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <FinancialSummaryCards
        totalIncome={monthlySummary?.revenue || 0}
        totalExpense={monthlySummary?.expenses || 0}
        balance={monthlySummary?.profit || 0}
        overdueAmount={kpis?.total_overdue || 0}
        previousIncome={prevMonthlySummary?.revenue}
        previousExpense={prevMonthlySummary?.expenses}
        previousBalance={prevMonthlySummary?.profit}
        isLoading={isLoading}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Column - Chart & Table */}
        <div className="space-y-6 lg:col-span-3">
          {/* Revenue vs Expense Chart */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <RevenueExpenseChart data={chartData} isLoading={chartLoading} />
          </div>

          {/* Filter Bar */}
          <FilterBar categories={categories} accounts={bankAccounts} onFilterChange={setFilters} />

          {/* Transactions Table */}
          <TransactionTable
            transactions={transactionsData?.data || []}
            isLoading={txLoading}
            page={page}
            totalPages={transactionsData?.pagination?.totalPages || 1}
            onPageChange={setPage}
            onRowClick={(tx) => console.log('Clicked:', tx)}
          />
        </div>

        {/* Right Column - Bank Accounts */}
        <div className="lg:col-span-1">
          <BankAccountsPanel
            accounts={bankAccounts}
            isLoading={isLoading}
            onAddAccount={() => console.log('Add account')} // Implement modal later
          // onViewAccount={(id) => console.log('View account:', id)}
          />
        </div>
      </div>

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTransaction}
        categories={categories}
        accounts={bankAccounts}
      />
    </div>
  );
}
