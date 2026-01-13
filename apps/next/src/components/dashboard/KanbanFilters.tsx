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
        <div className="flex items-center gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar casos por nome ou descrição..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Category Filter */}
            <div className="relative">
                <select
                    value={filterCategory || ''}
                    onChange={(e) => setFilterCategory(e.target.value || null)}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition cursor-pointer"
                >
                    <option value="">Todas as Categorias</option>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                            {config.label}
                        </option>
                    ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Priority Filter */}
            <div className="relative">
                <select
                    value={filterPriority || ''}
                    onChange={(e) => setFilterPriority(e.target.value || null)}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition cursor-pointer"
                >
                    <option value="">Todas as Prioridades</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Limpar
                </button>
            )}
        </div>
    );
}
