'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { AuthShell } from '@/components/layout/AuthShell';

export default function CreateTenantPage() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        // ... kept same logic ...
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:4000/api/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
                credentials: 'include',
            });

            if (res.ok) {
                const tenant = await res.json();
                await fetch('http://localhost:4000/api/tenants/me/active-tenant', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tenantId: tenant.id }),
                    credentials: 'include',
                });
                router.push('/dashboard');
            } else {
                alert('Failed to create tenant');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating tenant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell>
            <div className="mb-8">
                <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight mb-2 font-display">Criar seu escritório</h1>
                <p className="text-[#9da6b9] text-base font-normal leading-normal font-display">Comece criando um espaço de trabalho para seu time.</p>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-6 w-full">
                <div className="flex flex-col w-full">
                    <label className="flex flex-col w-full">
                        <p className="text-white text-sm font-medium leading-normal pb-2 font-display">Nome do Escritório</p>
                        <input
                            type="text"
                            placeholder="Ex: Silva & Advogados"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input flex w-full rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50 border border-[#3b4354] bg-[#1c2230] focus:border-[#1152d4] h-14 placeholder:text-[#9da6b9] px-4 text-base font-normal transition-all"
                            required
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center rounded-lg h-14 bg-[#1152d4] text-white text-base font-bold transition-all hover:bg-[#0e44b1] active:scale-[0.98] font-display"
                >
                    {loading ? 'Criando...' : 'Criar Escritório'}
                </button>
            </form>
        </AuthShell>
    );
}
