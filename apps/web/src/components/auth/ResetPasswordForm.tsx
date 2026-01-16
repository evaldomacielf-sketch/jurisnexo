'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { resetPasswordAction } from '@/actions/auth';

// ============================================
// 🔑 Reset Password Form Component
// ============================================

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPasswordAction({ token, password });

      if (result.success === false) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 2000);
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('[ResetPassword] Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (success) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Senha Redefinida!</h2>
          <p className="mb-4 text-gray-600">Sua senha foi alterada com sucesso.</p>
          <p className="text-sm text-gray-500">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Nova Senha</h1>
          <p className="text-gray-600">Digite sua nova senha abaixo</p>
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
          {/* Nova Senha */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#1152d4] disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Repita a senha"
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
                Redefinindo...
              </>
            ) : (
              'Redefinir Senha'
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-600 hover:text-[#1152d4]">
            Voltar para login
          </Link>
        </div>
      </div>
    </div>
  );
}
