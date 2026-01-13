'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { usePlan } from '@/hooks/usePlan';
import { useTenantContext } from '@/providers/TenantProvider';

export function Sidebar() {
    const { plan } = usePlan();
    const { tenant, isSubdomain } = useTenantContext();
    const pathname = usePathname();

    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loadingTenants, setLoadingTenants] = useState(false);
    const router = useRouter();

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        if (isSwitcherOpen && tenants.length === 0) {
            setLoadingTenants(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tenants/me`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    const list = Array.isArray(data) ? data : (data.data || []);
                    setTenants(list);
                    setLoadingTenants(false);
                })
                .catch(err => {
                    console.error("Failed to load tenants", err);
                    setLoadingTenants(false);
                });
        }
    }, [isSwitcherOpen, tenants.length]);

    const handleSwitchTenant = async (tenantId: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tenants/me/active-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId }),
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                if (data.token) {
                    document.cookie = `access_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
                }
                window.location.reload(); // Reload to refresh context
            }
        } catch (e) {
            console.error(e);
        }
    };

    const navItems = [
        { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
        { name: 'Casos', icon: 'gavel', path: '/dashboard/cases' },
        { name: 'WhatsApp', icon: 'chat', path: '/dashboard/whatsapp' },
        { name: 'Equipe', icon: 'group', path: '/dashboard/team' },
        { name: 'Configurações', icon: 'settings', path: '/dashboard/settings' },
    ];

    return (
        <aside className="flex flex-col w-64 bg-white dark:bg-[#1a2130] border-r border-[#dbdfe6] dark:border-[#2d3748] h-full shrink-0 font-display">
            <div className="p-6 flex flex-col items-center gap-4 text-center">
                <div className="w-40 h-auto shrink-0">
                    <img src="/logo-dashboard.png" alt="JurisNexo Premium" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="text-sm font-bold leading-tight dark:text-gray-100">
                        {tenant?.name || 'Crm Juridico + Whatsapp'}
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${isActive(item.path)
                            ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-[#616f89] hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <p className={`text-sm font-medium ${isActive(item.path) ? 'font-semibold' : ''}`}>{item.name}</p>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-[#dbdfe6] dark:border-[#2d3748]">
                {/* Dynamic Plan Status Card */}
                {plan?.status === 'TRIAL' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Período Trial</p>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{plan.daysLeft} dias</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <div className="bg-blue-600 h-full rounded-full w-[var(--prog)]" style={{ '--prog': `${(plan.daysLeft / 7) * 100}%` } as React.CSSProperties}></div>
                        </div>
                        <p className="text-[10px] text-[#616f89] mt-2 leading-tight">Assine agora para manter o acesso total.</p>
                    </div>
                )}
                {plan?.status === 'EXPIRED' && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-4 border border-red-100 dark:border-red-800">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-red-500 text-lg">lock</span>
                            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Plano Expirado</p>
                        </div>
                        <p className="text-[10px] text-red-800 dark:text-red-200 mt-2 leading-tight">Atualize seu plano para recuperar o acesso.</p>
                        <button className="mt-3 w-full py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition">Atualizar Agora</button>
                    </div>
                )}
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-all font-display">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Novo Caso
                </button>
            </div>
        </aside>
    );
}
