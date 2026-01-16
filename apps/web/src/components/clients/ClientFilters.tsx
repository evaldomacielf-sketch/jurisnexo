'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
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
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="min-w-[300px] flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email ou telefone..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ClientStatus | '')}
          title="Filtrar por status"
          className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-700"
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
          title="Filtrar por tipo"
          className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-700"
        >
          <option value="">Todos os Tipos</option>
          <option value={ClientType.INDIVIDUAL}>Pessoa Física</option>
          <option value={ClientType.BUSINESS}>Pessoa Jurídica</option>
        </select>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
