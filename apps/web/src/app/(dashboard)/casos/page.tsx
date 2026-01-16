import { Header } from '@/components/dashboard/Header';
import { CasesList } from '@/components/cases/CasesList';

export const metadata = {
    title: 'Processos | JurisNexo',
};

export default function CasesPage() {
    return (
        <>
            <Header showSearch={false} />
            <div className="p-8">
                <CasesList />
            </div>
        </>
    );
}
