'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    RefreshCw
} from 'lucide-react';
import { financeApi } from '@/lib/api/finance';
import {
    FinancialSummaryCards,
    RevenueExpenseChart,
    TransactionTable,
    BankAccountsPanel,
    CreateTransactionModal,
    FilterBar
} from '@/components/finance';

// Month navigation helper


export default function FinanceDashboard() {
    const queryClient = useQueryClient();

    // Current month/year state
    const now = new Date();
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<{
        search: string;
        type: 'ALL' | 'INCOME' | 'EXPENSE';
        status: 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE';
        category_id: string;
        account_id: string;
        date_from: string;
        date_to: string;
    }>({
        search: '',
        type: 'ALL',
        status: 'ALL',
        category_id: '',
        account_id: '',
        date_from: '',
        date_to: '',
    });

    // Navigate months
    const navigateMonth = (direction: -1 | 1) => {
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
    // Note: The Monthly Summary endpoint handles this internally, but transaction list needs date filters
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

    // --- QUERIES ---

    // 1. Dashboard KPIs (Global or Monthly?) 
    // The backend endpoint /finance/reports/dashboard currently returns ALL TIME stats or generic KPIs. 
    // We might want to use the Monthly Summary for the cards mostly.
    const { data: kpis, isLoading: kpisLoading } = useQuery({
        queryKey: ['finance', 'kpis'],
        queryFn: () => financeApi.getDashboardKPIs(),
        staleTime: 60000,
    });

    // 2. Monthly Summary (Materialized View)
    const { data: monthlySummary, isLoading: summaryLoading } = useQuery({
        queryKey: ['finance', 'monthly', currentYear, currentMonth],
        queryFn: () => financeApi.getMonthlySummary(currentYear, currentMonth),
        staleTime: 60000,
    });

    // 3. Previous Month for Comparison
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const { data: prevMonthlySummary } = useQuery({
        queryKey: ['finance', 'monthly', prevYear, prevMonth],
        queryFn: () => financeApi.getMonthlySummary(prevYear, prevMonth),
        staleTime: 60000,
    });

    // 4. Categories
    const { data: categories = [] } = useQuery({
        queryKey: ['finance', 'categories'],
        queryFn: () => financeApi.getCategories(),
        staleTime: 300000, // 5 minutes
    });

    // 5. Bank Accounts
    const { data: bankAccounts = [] } = useQuery({
        queryKey: ['finance', 'accounts'],
        queryFn: () => financeApi.getBankAccounts(),
        staleTime: 60000,
    });

    // 6. Transactions (Unified List)
    const { data: transactionsData, isLoading: txLoading } = useQuery({
        queryKey: ['finance', 'transactions', page, filters, currentYear, currentMonth],
        queryFn: () => {
            const apiFilters: any = { ...filters };
            if (apiFilters.status === 'ALL') delete apiFilters.status;
            if (apiFilters.type === 'ALL') delete apiFilters.type;

            return financeApi.getTransactions({
                page,
                limit: 10,
                ...apiFilters,
                // Force filtering by the current view's month if no specific date range is selected
                due_date_from: filters.date_from || startDate,
                due_date_to: filters.date_to || endDate,
            });
        },
        placeholderData: (previousData) => previousData,
    });

    // 7. Category Stats (for Chart)
    const { data: categoryStats = [], isLoading: chartLoading } = useQuery({
        queryKey: ['finance', 'stats', 'categories', currentYear, currentMonth],
        queryFn: () => financeApi.getCategoryStats(startDate, endDate),
        staleTime: 60000,
    });

    // Transform Category Stats for Chart
    const chartData = useMemo(() => {
        return categoryStats.map((stat: any) => ({
            category: stat.category?.name || 'Sem Categoria',
            income: stat.type === 'INCOME' ? Number(stat.total) : 0,
            expense: stat.type === 'EXPENSE' ? Number(stat.total) : 0,
        }));
    }, [categoryStats]);

    // Handle create transaction
    const handleCreateTransaction = async (data: any) => {
        try {
            if (data.type === 'INCOME') {
                await financeApi.createReceivable(data);
            } else {
                await financeApi.createPayable(data);
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
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header with Month Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
                    <p className="text-gray-500 mt-1">Gerencie as finanças do escritório</p>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white rounded-xl border px-4 py-2 shadow-sm">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Mês anterior"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="font-semibold text-gray-900 min-w-[140px] text-center capitalize">
                            {androidMonthName(currentMonth)} {currentYear}
                        </span>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Próximo mês"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['finance'] })}
                        className="p-2.5 bg-white border rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        aria-label="Atualizar dados"
                        title="Atualizar"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                    >
                        <Plus className="w-5 h-5" />
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Chart & Table */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Revenue vs Expense Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <RevenueExpenseChart data={chartData} isLoading={chartLoading} />
                    </div>

                    {/* Filter Bar */}
                    <FilterBar
                        categories={categories}
                        accounts={bankAccounts}
                        onFilterChange={setFilters}
                    />

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
                        onViewAccount={(id) => console.log('View account:', id)}
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

// Helper to avoid name collision error if logic stays same
function androidMonthName(month: number): string {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril',
        'Maio', 'Junho', 'Julho', 'Agosto',
        'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1] || 'Mês Inválido';
}
