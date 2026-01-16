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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Clientes</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie seus clientes e leads</p>
          </div>
          <Link
            href="/clientes/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-opacity-90"
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
        <div key={i} className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      ))}
    </div>
  );
}
