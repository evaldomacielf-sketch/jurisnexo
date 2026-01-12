'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTenantPage() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Need auth token. Assuming HttpOnly cookie is set, simple fetch works.
            const res = await fetch('http://localhost:4000/api/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (res.ok) {
                const tenant = await res.json();
                // Automatically switch to this tenant?
                await fetch('http://localhost:4000/api/tenants/me/active-tenant', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tenantId: tenant.id })
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
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-4">Criar seu escritório</h1>
                <p className="text-gray-600 mb-6">Comece criando um espaço de trabalho para seu time.</p>

                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Escritório</label>
                        <input
                            type="text"
                            placeholder="Ex: Silva & Advogados"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                        {loading ? 'Criando...' : 'Criar Escritório'}
                    </button>
                </form>
            </div>
        </main>
    );
}
