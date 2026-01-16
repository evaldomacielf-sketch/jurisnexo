import { Header } from '@/components/dashboard/Header';
import { ClientForm } from '@/components/clients/ClientForm';

export const metadata = {
  title: 'Editar Cliente | JurisNexo',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <Header showSearch={false} />
      <div className="p-8">
        <ClientForm clientId={id} />
      </div>
    </>
  );
}
