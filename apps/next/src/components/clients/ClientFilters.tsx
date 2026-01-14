'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ClientStatus, ClientType } from '@/lib/types/client';

export function ClientFilters() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<ClientStatus | ''>('');
    const [type, setType] = useState<ClientType | ''>('');

    const hasFilters = search || status || type;

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setType('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nome, email ou telefone..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ClientStatus | '')}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none"
                >
                    <option value="">Todos os Status</option>
                    <option value={ClientStatus.ACTIVE}>Ativo</option>
                    <option value={ClientStatus.LEAD}>Lead</option>
                    <option value={ClientStatus.INACTIVE}>Inativo</option>
                    <option value={ClientStatus.ARCHIVED}>Arquivado</option>
                </select>

                {/* Type Filter */}
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ClientType | '')}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none"
                >
                    <option value="">Todos os Tipos</option>
                    <option value={ClientType.INDIVIDUAL}>Pessoa Física</option>
                    <option value={ClientType.BUSINESS}>Pessoa Jurídica</option>
                </select>

                {/* Clear Filters */}
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Limpar
                    </button>
                )}
            </div>
        </div>
    );
}
