'use client';

import { Search, ChevronDown, Building2 } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

// ============================================
// 🎯 Dashboard Header (com Notificações)
// ============================================

interface HeaderProps {
    tenantName?: string;
    showSearch?: boolean;
}

export function Header({ tenantName = 'Seu Escritório', showSearch = true }: HeaderProps) {
    return (
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex items-center gap-4 flex-1">
                {/* Tenant Selector */}
                <div className="relative group">
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                        <Building2 className="w-5 h-5 text-primary" />
                        <div className="text-left">
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-tight leading-none">
                                Escritório
                            </p>
                            <p className="text-sm font-bold leading-tight text-gray-900 dark:text-white">
                                {tenantName}
                            </p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Divider */}
                {showSearch && (
                    <>
                        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2"></div>

                        {/* Search Bar */}
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition"
                                placeholder="Buscar casos, documentos ou clientes..."
                                type="text"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-4">
                {/* Notification Center */}
                <NotificationCenter />
            </div>
        </header>
    );
}
