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
  SparklesIcon,
  BoltIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  ViewColumnsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Casos', href: '/casos', icon: FolderIcon },
    { name: 'Kanban', href: '/kanban', icon: ViewColumnsIcon },
    { name: 'CRM', href: '/crm/pipeline', icon: PresentationChartLineIcon },
    { name: 'Clientes', href: '/clientes', icon: UsersIcon },
    { name: 'Equipe', href: '/equipe', icon: UserGroupIcon },
    { name: 'Financeiro', href: '/financeiro', icon: CurrencyDollarIcon },
    { name: 'Agenda', href: '/calendario', icon: CalendarIcon },
    { name: 'WhatsApp', href: '/mensagens', icon: ChatBubbleLeftIcon, badge: 5 },
    { name: 'AI Assistant', href: '/ai', icon: SparklesIcon },
    { name: 'Automações', href: '/automacoes', icon: BoltIcon },
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
    <aside
      className={cn(
        'flex h-screen shrink-0 flex-col border-r bg-background transition-all duration-300 relative z-50',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className={cn("flex h-14 items-center border-b px-6 transition-all", isCollapsed ? "justify-center px-0" : "justify-between")}>
        {!isCollapsed && <h1 className="text-xl font-bold">JurisNexo</h1>}
        {isCollapsed && <span className="font-bold text-xl">JN</span>}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4 custom-scrollbar">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>}
              {!isCollapsed && item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {item.badge}
                </span>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
          {!isCollapsed && <span>Recolher</span>}
        </button>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={isCollapsed ? "Sair" : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50',
            isCollapsed && 'justify-center'
          )}
        >
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
