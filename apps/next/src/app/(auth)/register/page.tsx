import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { isAuthenticated } from '@/lib/auth/session';

// ============================================
// 📝 Register Page
// ============================================

export const metadata = {
    title: 'Criar Conta | JurisNexo',
    description: 'Crie sua conta JurisNexo gratuitamente',
};

export default async function RegisterPage() {
    // Redireciona se já estiver autenticado
    const authenticated = await isAuthenticated();
    if (authenticated) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-12">
            <Suspense fallback={<div>Carregando...</div>}>
                <RegisterForm />
            </Suspense>
        </div>
    );
}
