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
            <Header tenantName="Silva & Associados" showSearch={false} />

            <div className="p-8">
                <Suspense fallback={<DetailsSkeleton />}>
                    <ClientDetails clientId={id} />
                </Suspense>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    );
}
