'use client';

import { Search, Filter, X } from 'lucide-react';
import { useKanbanStore } from '@/lib/store/kanban-store';
import { CATEGORY_CONFIG } from '@/lib/types/kanban';

// ============================================
// 🔍 Kanban Filters & Search
// ============================================

export function KanbanFilters() {
  const {
    searchQuery,
    filterCategory,
    filterPriority,
    setSearchQuery,
    setFilterCategory,
    setFilterPriority,
  } = useKanbanStore();

  const hasActiveFilters = filterCategory || filterPriority || searchQuery;

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory(null);
    setFilterPriority(null);
  };

  return (
    <div className="mb-6 flex items-center gap-4">
      {/* Search Bar */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar casos por nome ou descrição..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/50 dark:border-gray-700 dark:bg-gray-800"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="relative">
        <select
          value={filterCategory || ''}
          onChange={(e) => setFilterCategory(e.target.value || null)}
          title="Filtrar por categoria"
          className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/50 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">Todas as Categorias</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
        <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Priority Filter */}
      <div className="relative">
        <select
          value={filterPriority || ''}
          onChange={(e) => setFilterPriority(e.target.value || null)}
          title="Filtrar por prioridade"
          className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/50 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">Todas as Prioridades</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">Alta</option>
          <option value="URGENT">Urgente</option>
        </select>
        <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
          Limpar
        </button>
      )}
    </div>
  );
}
