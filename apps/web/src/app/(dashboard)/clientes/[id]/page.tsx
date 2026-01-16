import { Header } from '@/components/dashboard/Header';
import { ClientDetails } from '@/components/clients/ClientDetails';
import { ClientInteractions } from '@/components/clients/ClientInteractions';
import { ClientDocuments } from '@/components/clients/ClientDocuments';
import { Suspense } from 'react';

export const metadata = {
  title: 'Detalhes do Cliente | JurisNexo',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <Header showSearch={false} />

      <div className="p-8">
        <Suspense fallback={<DetailsSkeleton />}>
          <ClientDetails clientId={id} />
        </Suspense>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Suspense fallback={<div>Carregando...</div>}>
            <ClientInteractions clientId={id} />
          </Suspense>

          <Suspense fallback={<div>Carregando...</div>}>
            <ClientDocuments clientId={id} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

function DetailsSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-2 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
}
