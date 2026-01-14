import { Header } from '@/components/dashboard/Header';
import { ClientForm } from '@/components/clients/ClientForm';

export const metadata = {
    title: 'Novo Cliente | JurisNexo',
};

export default function NewClientPage() {
    return (
        <>
            <Header tenantName="Silva & Associados" showSearch={false} />
            <div className="p-8">
                <ClientForm />
            </div>
        </>
    );
}
