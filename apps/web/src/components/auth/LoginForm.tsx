'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { loginAction } from '@/actions/auth';
import type { LoginDTO } from '@/lib/auth/types';

// ============================================
// 🔐 Login Form Component
// ============================================

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginDTO>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginAction(formData);

      if (!result.success) {
        setError(result.error);
        console.error('[LoginForm] Login failure:', result.error, 'Code:', result.code);
        return;
      }

      // Sucesso - redireciona para dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('[LoginForm] Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Limpa erro ao digitar
    if (error) setError('');
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Bem-vindo ao JurisNexo</h1>
          <p className="text-gray-600">Faça login para acessar sua conta</p>
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
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#1152d4] disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#1152d4] disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-sm text-[#1152d4] hover:underline">
              Esqueceu sua senha?
            </Link>
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
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link href="/auth/register" className="font-medium text-[#1152d4] hover:underline">
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
