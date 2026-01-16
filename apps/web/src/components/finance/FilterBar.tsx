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

  const hasActiveFilters =
    filters.type !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.category_id !== '' ||
    filters.account_id !== '' ||
    filters.date_from !== '' ||
    filters.date_to !== '';

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {/* Main filter row */}
      <div className="flex flex-wrap items-center gap-3 p-4">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar lançamentos..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full rounded-lg border py-2.5 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type filter */}
        <select
          value={filters.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="min-w-[130px] rounded-lg border bg-white px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
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
          className="min-w-[130px] rounded-lg border bg-white px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
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
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 transition-all ${
            isExpanded || hasActiveFilters
              ? 'border-blue-200 bg-blue-50 text-blue-600'
              : 'hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filtros
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
          {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-blue-600" />}
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <X className="h-4 w-4" />
            Limpar
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="border-t bg-gray-50 px-4 pb-4 pt-2 duration-200 animate-in slide-in-from-top">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Category */}
            <div>
              <label
                htmlFor="filter-category"
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Categoria
              </label>
              <select
                id="filter-category"
                value={filters.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account */}
            <div>
              <label
                htmlFor="filter-account"
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Conta
              </label>
              <select
                id="filter-account"
                value={filters.account_id}
                onChange={(e) => handleChange('account_id', e.target.value)}
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas contas</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div>
              <label
                htmlFor="filter-date-from"
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Data inicial
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="filter-date-from"
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleChange('date_from', e.target.value)}
                  className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Date to */}
            <div>
              <label
                htmlFor="filter-date-to"
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                Data final
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="filter-date-to"
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleChange('date_to', e.target.value)}
                  className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
