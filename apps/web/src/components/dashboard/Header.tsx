'use client';

import { Search, ChevronDown, Building2 } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { useTenantContext } from '@/providers/TenantProvider';

// ============================================
// 🎯 Dashboard Header (com Notificações)
// ============================================

interface HeaderProps {
  showSearch?: boolean;
}

export function Header({ showSearch = true }: HeaderProps) {
  const { tenant, loading } = useTenantContext();

  const tenantName = loading ? 'Carregando...' : tenant?.name || 'Seu Escritório';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-1 items-center gap-4">
        {/* Tenant Selector */}
        <div className="group relative">
          <button
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition-colors hover:bg-white dark:border-gray-700 dark:bg-gray-700/50 dark:hover:bg-gray-700"
            aria-label="Selecionar escritório"
          >
            <Building2 className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase leading-none tracking-tight text-gray-600 dark:text-gray-400">
                Escritório
              </p>
              <p className="text-sm font-bold leading-tight text-gray-900 dark:text-white">
                {tenantName}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Divider */}
        {showSearch && (
          <>
            <div className="mx-2 h-8 w-[1px] bg-gray-200 dark:bg-gray-700"></div>

            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-700"
                placeholder="Buscar casos, documentos ou clientes..."
                type="text"
              />
            </div>
          </>
        )}
      </div>

      {/* Right Actions */}
      <div className="ml-4 flex items-center gap-4">
        {/* Notification Center */}
        <NotificationCenter />
      </div>
    </header>
  );
}
