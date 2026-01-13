import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { isAuthenticated } from '@/lib/auth/session';

// ============================================
// 🔐 Login Page
// ============================================

export const metadata = {
    title: 'Login | JurisNexo',
    description: 'Faça login na sua conta JurisNexo',
};

export default async function LoginPage() {
    // Redireciona se já estiver autenticado
    const authenticated = await isAuthenticated();
    if (authenticated) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Suspense fallback={<div>Carregando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
