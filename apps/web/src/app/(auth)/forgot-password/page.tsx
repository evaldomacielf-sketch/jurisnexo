import { Suspense } from 'react';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

// ============================================
// 📧 Forgot Password Page
// ============================================

export const metadata = {
  title: 'Esqueci Minha Senha | JurisNexo',
  description: 'Recupere sua senha JurisNexo',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
