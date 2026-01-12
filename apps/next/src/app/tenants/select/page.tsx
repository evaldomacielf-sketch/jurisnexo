'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/layout/AuthShell';

interface Tenant {
    id: string;
    name: string;
    slug: string;
}

export default function TenantSelectPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('http://localhost:4000/api/tenants/me', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                console.log('Tenants API response:', data);
                if (Array.isArray(data)) {
                    setTenants(data);
                } else {
                    console.error('Expected array but got:', data);
                    // Fallback if wrapped in object like { data: [...] }
                    if (data.data && Array.isArray(data.data)) setTenants(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const selectTenant = async (tenantId: string) => {
        try {
            const res = await fetch('http://localhost:4000/api/tenants/me/active-tenant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId }),
                credentials: 'include',
            });
            if (res.ok) {
                router.push('/dashboard');
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-white bg-[#101622]">Carregando...</div>;

    return (
        <AuthShell>
            <div className="mb-8">
                <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight mb-2 font-display">Selecionar Escritório</h1>
                <p className="text-[#9da6b9] text-base font-normal leading-normal font-display">Escolha o ambiente de trabalho.</p>
            </div>

            <div className="space-y-4 w-full">
                {tenants.map(t => (
                    <button
                        key={t.id}
                        onClick={() => selectTenant(t.id)}
                        className="w-full text-left p-4 rounded-xl bg-[#1c2230] hover:bg-[#252b3b] border border-[#3b4354] hover:border-[#1152d4] transition-all flex justify-between items-center group"
                    >
                        <span className="font-bold text-white text-lg font-display">{t.name}</span>
                        <span className="text-[#9da6b9] group-hover:text-[#1152d4] material-symbols-outlined">arrow_forward</span>
                    </button>
                ))}

                {tenants.length === 0 && (
                    <div className="text-center text-[#9da6b9] py-4 bg-[#1c2230]/50 rounded-xl border border-dashed border-[#3b4354]">
                        Nenhum escritório encontrado.
                    </div>
                )}
            </div>

            <div className="mt-8 border-t border-[#282e39] pt-6 text-center">
                <button
                    onClick={() => router.push('/tenants/create')}
                    className="flex items-center justify-center gap-2 text-[#1152d4] hover:text-[#0e44b1] font-bold font-display w-full py-3 rounded-lg hover:bg-[#1152d4]/10 transition-colors"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Criar novo escritório (+ por R$49/mês)
                </button>
            </div>
        </AuthShell>
    );
}
