'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown, Calendar } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    color?: string;
}

interface Account {
    id: string;
    name: string;
}

interface FilterValues {
    search: string;
    type: 'ALL' | 'INCOME' | 'EXPENSE';
    status: 'ALL' | 'PENDING' | 'PAID' | 'OVERDUE';
    category_id: string;
    account_id: string;
    date_from: string;
    date_to: string;
}

interface FilterBarProps {
    categories: Category[];
    accounts: Account[];
    onFilterChange: (filters: FilterValues) => void;
}

export function FilterBar({ categories, accounts, onFilterChange }: FilterBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState<FilterValues>({
        search: '',
        type: 'ALL',
        status: 'ALL',
        category_id: '',
        account_id: '',
        date_from: '',
        date_to: '',
    });

    const handleChange = (key: keyof FilterValues, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const emptyFilters: FilterValues = {
            search: '',
            type: 'ALL',
            status: 'ALL',
            category_id: '',
            account_id: '',
            date_from: '',
            date_to: '',
        };
        setFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    const hasActiveFilters = filters.type !== 'ALL' ||
        filters.status !== 'ALL' ||
        filters.category_id !== '' ||
        filters.account_id !== '' ||
        filters.date_from !== '' ||
        filters.date_to !== '';

    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            {/* Main filter row */}
            <div className="p-4 flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar lançamentos..."
                        value={filters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>

                {/* Type filter */}
                <select
                    value={filters.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white min-w-[130px]"
                    aria-label="Tipo de lançamento"
                >
                    <option value="ALL">Todos tipos</option>
                    <option value="INCOME">✅ Receitas</option>
                    <option value="EXPENSE">❌ Despesas</option>
                </select>

                {/* Status filter */}
                <select
                    value={filters.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white min-w-[130px]"
                    aria-label="Status do lançamento"
                >
                    <option value="ALL">Todos status</option>
                    <option value="PENDING">⏳ Pendente</option>
                    <option value="PAID">✅ Pago</option>
                    <option value="OVERDUE">⚠️ Vencido</option>
                </select>

                {/* Expand button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all ${isExpanded || hasActiveFilters
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    Filtros
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    {hasActiveFilters && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                </button>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Limpar
                    </button>
                )}
            </div>

            {/* Expanded filters */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t bg-gray-50 animate-in slide-in-from-top duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Category */}
                        <div>
                            <label htmlFor="filter-category" className="block text-xs font-medium text-gray-500 mb-1">
                                Categoria
                            </label>
                            <select
                                id="filter-category"
                                value={filters.category_id}
                                onChange={(e) => handleChange('category_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                            >
                                <option value="">Todas categorias</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Account */}
                        <div>
                            <label htmlFor="filter-account" className="block text-xs font-medium text-gray-500 mb-1">
                                Conta
                            </label>
                            <select
                                id="filter-account"
                                value={filters.account_id}
                                onChange={(e) => handleChange('account_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                            >
                                <option value="">Todas contas</option>
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date from */}
                        <div>
                            <label htmlFor="filter-date-from" className="block text-xs font-medium text-gray-500 mb-1">
                                Data inicial
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="filter-date-from"
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => handleChange('date_from', e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Date to */}
                        <div>
                            <label htmlFor="filter-date-to" className="block text-xs font-medium text-gray-500 mb-1">
                                Data final
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="filter-date-to"
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => handleChange('date_to', e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
