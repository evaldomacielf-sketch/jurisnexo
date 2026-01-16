'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    HomeIcon,
    FolderIcon,
    UsersIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    ChatBubbleLeftIcon,
    ChartBarIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { logoutAction } from '@/actions/auth';
import { useState } from 'react';

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}

export function Sidebar() {
    const pathname = usePathname();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const navigationItems: NavigationItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Casos', href: '/casos', icon: FolderIcon },
        { name: 'Clientes', href: '/clientes', icon: UsersIcon },
        { name: 'Financeiro', href: '/financeiro', icon: CurrencyDollarIcon },
        { name: 'Agenda', href: '/agenda', icon: CalendarIcon },
        { name: 'WhatsApp', href: '/whatsapp', icon: ChatBubbleLeftIcon, badge: 5 },
        { name: 'Relatórios', href: '/relatorios', icon: ChartBarIcon },
        { name: 'Configurações', href: '/configuracoes', icon: Cog6ToothIcon },
    ];

    const handleLogout = async () => {
        if (isLoggingOut) return;
        if (confirm('Deseja realmente sair?')) {
            setIsLoggingOut(true);
            await logoutAction();
        }
    };

    return (
        <aside className="flex h-screen w-64 flex-col border-r bg-background shrink-0">
            <div className="flex h-14 items-center border-b px-6">
                <h1 className="text-xl font-bold">JurisNexo</h1>
            </div>

            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                {navigationItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-4">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}
