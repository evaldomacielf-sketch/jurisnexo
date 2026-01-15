import { Header } from '@/components/dashboard/Header';
import { ClientsList } from '@/components/clients/ClientsList';
import { ClientFilters } from '@/components/clients/ClientFilters';
import { Suspense } from 'react';

import Link from 'next/link';

export const metadata = {
    title: 'Clientes | JurisNexo',
    description: 'Gestão de clientes',
};

export default function ClientsPage() {
    return (
        <>
            <Header showSearch={false} />

            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Clientes
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Gerencie seus clientes e leads
                        </p>
                    </div>
                    <Link
                        href="/dashboard/clients/new"
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition flex items-center gap-2"
                    >
                        <span>+</span>
                        Novo Cliente
                    </Link>
                </div>

                <Suspense fallback={<ClientsListSkeleton />}>
                    <ClientFilters />
                    <ClientsList />
                </Suspense>
            </div>
        </>
    );
}

function ClientsListSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
        </div>
    );
}
