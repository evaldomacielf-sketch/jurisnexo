'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    MessageSquare,
    Calendar,
    Users,
    FileText,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Gavel,
    Plus,
} from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import type { AuthUser } from '@/lib/auth/types';

// ============================================
// 📂 Sidebar Component (Atualizado com Logo)
// ============================================

interface SidebarProps {
    user?: AuthUser; // Optional to prevent crash if undefined initially
    tenantName?: string;
}

const MENU_ITEMS = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Kanban',
        href: '/dashboard/kanban',
        icon: Gavel,
    },
    {
        label: 'Casos',
        href: '/dashboard/cases',
        icon: FileText,
    },
    {
        label: 'WhatsApp',
        href: '/dashboard/whatsapp',
        icon: MessageSquare,
    },
    {
        label: 'Agendamentos',
        href: '/dashboard/schedule',
        icon: Calendar,
    },
    {
        label: 'Equipe',
        href: '/dashboard/team',
        icon: Users,
    },
    {
        label: 'Configurações',
        href: '/dashboard/settings',
        icon: Settings,
    },
] as const;

export function Sidebar({ user = { id: 'temp', name: 'User', email: 'user@demo.com', emailVerified: true, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, tenantName = 'Demo Tenant' }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        // eslint-disable-next-line no-restricted-globals
        if (confirm('Deseja realmente sair?')) {
            setIsLoggingOut(true);
            await logoutAction();
        }
    };

    return (
        <aside
            className={`relative h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 shrink-0 ${collapsed ? 'w-20' : 'w-64'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Logo Header */}
                <div className="p-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
                    {!collapsed ? (
                        <div className="flex items-center gap-3 flex-1">
                            {/* Fallback to simple text if image fails or provided path is invalid */}
                            <div className="size-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">JN</div>
                            <div>
                                <h1 className="text-base font-bold leading-none text-gray-900 dark:text-white">
                                    JurisNexo
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                                    Gestão Jurídica
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center w-full">
                            <div className="size-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">JN</div>
                        </div>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition shrink-0 absolute -right-3 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
                    >
                        {collapsed ? (
                            <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        )}
                    </button>
                </div>

                {/* Tenant Info */}
                {!collapsed && tenantName && (
                    <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">
                            Escritório
                        </p>
                        <p className="text-sm text-blue-900 dark:text-blue-300 font-semibold truncate">
                            {tenantName}
                        </p>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                    <ul className="space-y-1">
                        {MENU_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition group ${isActive
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <Icon className={`w-5 h-5 flex-shrink-0`} />
                                        {!collapsed && (
                                            <span className="font-medium text-sm">{item.label}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Trial Period */}
                    {!collapsed && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4 border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                    Período Trial
                                </p>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">7 dias</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full w-1/2 rounded-full"></div>
                            </div>
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-2 leading-tight">
                                Assine agora para manter o acesso total.
                            </p>
                        </div>
                    )}

                    {/* New Case Button */}
                    <button
                        className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all mb-3 shadow-lg shadow-blue-600/30 ${collapsed ? 'px-2' : ''
                            }`}
                    >
                        <Plus className="w-5 h-5" />
                        {!collapsed && 'Novo Caso'}
                    </button>

                    {/* User Info */}
                    <Link
                        href="/dashboard/profile"
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition mb-2 ${collapsed ? 'justify-center' : ''
                            }`}
                        title={collapsed ? user.name : undefined}
                    >
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-white font-semibold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                            </div>
                        )}
                    </Link>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed w-full ${collapsed ? 'justify-center' : ''
                            }`}
                        title={collapsed ? 'Sair' : undefined}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="font-medium">Sair</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
