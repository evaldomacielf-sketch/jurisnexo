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
function getMonthName(month: number): string {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril',
        'Maio', 'Junho', 'Julho', 'Agosto',
        'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
}

export default function FinanceDashboard() {
    const queryClient = useQueryClient();

    // Current month/year state
    const now = new Date();
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        type: 'ALL' as const,
        status: 'ALL' as const,
        category_id: '',
        account_id: '',
        date_from: '',
        date_to: '',
    });

    // Filters are passed to FilterBar and stored for API calls
    console.debug('Current filters:', filters);

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

    // React Query - Dashboard KPIs
    const { data: kpis, isLoading: kpisLoading } = useQuery({
        queryKey: ['finance', 'kpis', currentYear, currentMonth],
        queryFn: () => financeApi.getDashboardKPIs(),
        staleTime: 30000,
    });

    // React Query - Monthly Summary
    const { data: monthlySummary, isLoading: summaryLoading } = useQuery({
        queryKey: ['finance', 'monthly', currentYear, currentMonth],
        queryFn: () => financeApi.getMonthlySummary(currentYear, currentMonth),
        staleTime: 30000,
    });

    // React Query - Previous month for comparison
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const { data: prevMonthlySummary } = useQuery({
        queryKey: ['finance', 'monthly', prevYear, prevMonth],
        queryFn: () => financeApi.getMonthlySummary(prevYear, prevMonth),
        staleTime: 60000,
    });

    // Mock data for components (replace with real API when ready)
    const transactions = useMemo(() => {
        // Sample transactions for demo
        return [
            { id: '1', type: 'INCOME' as const, description: 'Honorários - Cliente Silva', amount: 5000, date: '2026-01-10', status: 'PAID' as const, category: 'Honorários', categoryColor: '#22C55E' },
            { id: '2', type: 'EXPENSE' as const, description: 'Aluguel escritório', amount: 3000, date: '2026-01-05', status: 'PAID' as const, category: 'Aluguel', categoryColor: '#EF4444' },
            { id: '3', type: 'INCOME' as const, description: 'Consultoria jurídica', amount: 2500, date: '2026-01-15', status: 'PENDING' as const, category: 'Consultorias', categoryColor: '#3B82F6' },
            { id: '4', type: 'EXPENSE' as const, description: 'Software jurídico', amount: 500, date: '2026-01-20', status: 'OVERDUE' as const, category: 'Software', categoryColor: '#8B5CF6' },
        ];
    }, []);

    const bankAccounts = useMemo(() => [
        { id: '1', name: 'Conta Principal', type: 'CHECKING' as const, balance: 45000, color: '#3B82F6' },
        { id: '2', name: 'Reserva', type: 'SAVINGS' as const, balance: 25000, color: '#22C55E' },
        { id: '3', name: 'Investimentos', type: 'INVESTMENT' as const, balance: 100000, color: '#8B5CF6' },
    ], []);

    const categories = useMemo(() => [
        { id: '1', name: 'Honorários', color: '#22C55E' },
        { id: '2', name: 'Consultorias', color: '#3B82F6' },
        { id: '3', name: 'Aluguel', color: '#EF4444' },
        { id: '4', name: 'Software', color: '#8B5CF6' },
    ], []);

    const chartData = useMemo(() => [
        { category: 'Honorários', income: 15000, expense: 0 },
        { category: 'Consultorias', income: 8000, expense: 0 },
        { category: 'Aluguel', income: 0, expense: 3000 },
        { category: 'Salários', income: 0, expense: 12000 },
        { category: 'Software', income: 0, expense: 1500 },
    ], []);

    // Handle create transaction
    const handleCreateTransaction = async (data: any) => {
        console.log('Creating transaction:', data);
        // API call would go here
        queryClient.invalidateQueries({ queryKey: ['finance'] });
    };

    const isLoading = kpisLoading || summaryLoading;

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header with Month Navigation */}
            <div className="flex items-center justify-between">
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
                        <span className="font-semibold text-gray-900 min-w-[160px] text-center">
                            {getMonthName(currentMonth)} {currentYear}
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
                totalIncome={monthlySummary?.revenue || kpis?.total_received || 0}
                totalExpense={monthlySummary?.expenses || kpis?.total_paid || 0}
                balance={monthlySummary?.profit || kpis?.cash_flow_balance || 0}
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
                    <RevenueExpenseChart data={chartData} isLoading={isLoading} />

                    {/* Filter Bar */}
                    <FilterBar
                        categories={categories}
                        accounts={bankAccounts}
                        onFilterChange={setFilters}
                    />

                    {/* Transactions Table */}
                    <TransactionTable
                        transactions={transactions}
                        isLoading={isLoading}
                        page={page}
                        totalPages={5}
                        onPageChange={setPage}
                        onRowClick={(tx) => console.log('Clicked:', tx)}
                    />
                </div>

                {/* Right Column - Bank Accounts */}
                <div className="lg:col-span-1">
                    <BankAccountsPanel
                        accounts={bankAccounts}
                        isLoading={isLoading}
                        onAddAccount={() => console.log('Add account')}
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
