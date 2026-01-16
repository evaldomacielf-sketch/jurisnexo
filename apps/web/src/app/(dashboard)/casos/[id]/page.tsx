import { Header } from '@/components/dashboard/Header';
import { CaseDetails } from '@/components/cases/CaseDetails';

export const metadata = {
  title: 'Detalhes do Processo | JurisNexo',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <Header showSearch={false} />
      <div className="p-8">
        <CaseDetails caseId={id} />
      </div>
    </>
  );
}
