'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { forgotPasswordAction } from '@/actions/auth';

// ============================================
// 📧 Forgot Password Form Component
// ============================================

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await forgotPasswordAction({ email });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('[ForgotPassword] Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (success) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Email Enviado!</h2>
            <p className="mb-6 text-gray-600">
              Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link para
              redefinir sua senha.
            </p>
            <p className="mb-6 text-sm text-gray-500">Verifique sua caixa de entrada e spam.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#1152d4] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Esqueceu sua senha?</h1>
          <p className="text-gray-600">
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#1152d4] disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1152d4] py-3 font-medium text-white transition hover:bg-[#0d3fa3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Link de Recuperação'
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1152d4]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </Link>
        </div>
      </div>
    </div>
  );
}
