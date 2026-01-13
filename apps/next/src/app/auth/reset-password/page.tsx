import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

// ============================================
// 🔑 Reset Password Page
// ============================================

export const metadata = {
    title: 'Redefinir Senha | JurisNexo',
    description: 'Crie uma nova senha para sua conta',
};

interface PageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const token = params.token;

    // Se não houver token, redireciona
    if (!token) {
        redirect('/auth/forgot-password');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Suspense fallback={<div>Carregando...</div>}>
                <ResetPasswordForm token={token} />
            </Suspense>
        </div>
    );
}
