'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { ThemeToggle } from './ThemeToggle';
import { usePlan } from '@/hooks/usePlan';
import { useTenantContext } from '@/providers/TenantProvider';

export function Header() {
    const { plan } = usePlan();
    const { tenant } = useTenantContext();
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loadingTenants, setLoadingTenants] = useState(false);
    const router = useRouter();

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
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-[#1a2130] border-b border-[#dbdfe6] dark:border-[#2d3748] shrink-0 font-display">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative group">
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[#dbdfe6] dark:border-[#2d3748] bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-blue-600">business</span>
                        <div className="text-left">
                            <p className="text-[10px] text-[#616f89] font-bold uppercase tracking-tight leading-none">Escritório</p>
                            <p className="text-sm font-bold leading-tight dark:text-gray-100">{tenant?.name || 'Selecionar Escritório'}</p>
                        </div>
                        <span className="material-symbols-outlined text-gray-400">unfold_more</span>
                    </button>

                    {isSwitcherOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsSwitcherOpen(false)}></div>
                            <div className="absolute top-full right-0 w-64 mt-2 bg-white dark:bg-[#1a2130] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
                                <div className="max-h-48 overflow-y-auto py-1">
                                    {loadingTenants ? (
                                        <div className="p-3 text-center text-xs text-gray-500">Carregando...</div>
                                    ) : (
                                        tenants.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => handleSwitchTenant(t.id)}
                                                className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between ${t.id === tenant?.id ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'text-gray-700 dark:text-gray-300'}`}
                                            >
                                                <span className="truncate">{t.name}</span>
                                                {t.id === tenant?.id && <span className="material-symbols-outlined text-sm">check</span>}
                                            </button>
                                        ))
                                    )}
                                </div>
                                <div className="border-t border-gray-100 dark:border-gray-700 p-1">
                                    <Link href="/tenants/create" className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-sm">add_circle</span>
                                        Novo Escritório
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Plan Status Badge */}
                {plan?.status === 'TRIAL' && (
                    <div className="px-3 py-1 ml-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                            Trial: {plan.daysLeft} dias
                        </span>
                    </div>
                )}
                {plan?.status === 'EXPIRED' && (
                    <div className="px-3 py-1 ml-2 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500 text-sm">lock</span>
                        <span className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase tracking-wide">
                            Expirado
                        </span>
                    </div>
                )}
                <div className="h-8 w-[1px] bg-[#dbdfe6] dark:bg-[#2d3748] mx-2"></div>
                <div className="relative w-full max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89] text-xl">search</span>
                    <input className="w-full pl-10 pr-4 py-2 bg-[#f6f6f8] dark:bg-gray-800 border-none rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600/50 outline-none font-display" placeholder="Buscar casos, documentos ou clientes..." type="text" />
                </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
                <ThemeToggle />
                <div className="h-8 w-[1px] bg-[#dbdfe6] dark:bg-[#2d3748] mx-2"></div>
                <button className="p-2 text-[#616f89] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2130]"></span>
                </button>
                <div className="h-8 w-[1px] bg-[#dbdfe6] dark:bg-[#2d3748] mx-2"></div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold leading-none text-gray-900 dark:text-gray-100">Dr. Ricardo Silva</p>
                        <p className="text-xs text-[#616f89] mt-1">Sócio Diretor</p>
                    </div>
                    <div className="size-9 rounded-full bg-center bg-cover border border-[#dbdfe6] bg-gray-200"></div>
                </div>
            </div>
        </header>
    );
}
