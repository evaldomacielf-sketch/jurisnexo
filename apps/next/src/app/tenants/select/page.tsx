'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
        fetch('http://localhost:4000/api/tenants/me')
            .then(res => res.json())
            .then(data => {
                setTenants(data);
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
                body: JSON.stringify({ tenantId })
            });
            if (res.ok) {
                router.push('/dashboard');
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">Selecionar Escritório</h1>

                <div className="space-y-3">
                    {tenants.map(t => (
                        <button
                            key={t.id}
                            onClick={() => selectTenant(t.id)}
                            className="w-full text-left p-4 border rounded hover:bg-gray-50 flex justify-between items-center group"
                        >
                            <span className="font-medium text-lg">{t.name}</span>
                            <span className="text-gray-400 group-hover:text-blue-600">Entrar &rarr;</span>
                        </button>
                    ))}

                    {tenants.length === 0 && (
                        <div className="text-center text-gray-500 py-4">Nenhum escritório encontrado.</div>
                    )}
                </div>

                <div className="mt-8 border-t pt-4 text-center">
                    <button
                        onClick={() => router.push('/tenants/create')}
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Criar novo escritório (+ por R$49/mês)
                    </button>
                </div>
            </div>
        </main>
    );
}
