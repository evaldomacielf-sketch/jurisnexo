import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decode } from 'jsonwebtoken';

export default function DashboardPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        redirect('/auth/login');
    }

    // Decode token (insecure parse, just for claims check)
    // Verify should ideally happen in middleware.
    const payload: any = decode(token);

    if (!payload || !payload.tenant_id) {
        // No tenant context
        redirect('/tenants/select');
    }

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="mb-4">
                Bem-vindo ao escritório do Tenant ID: <strong>{payload.tenant_id}</strong>
            </p>

            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Dados do Escritório</h2>
                <p>Aqui seriam exibidos os processos, clientes, etc. isolados por RLS.</p>
            </div>

            <div className="mt-8">
                <a href="/tenants/select" className="text-blue-600 hover:underline">
                    &larr; Trocar Escritório (Switcher)
                </a>
            </div>
        </main>
    );
}
