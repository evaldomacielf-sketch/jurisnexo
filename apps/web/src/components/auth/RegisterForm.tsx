'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  Building2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
} from 'lucide-react';
import { registerAction } from '@/actions/auth';
import { generateSlug, isValidSlug } from '@/lib/utils/slug';
import type { RegisterDTO } from '@/lib/auth/types';

// ============================================
// 📝 Register Form Component
// ============================================

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterDTO>({
    name: '',
    email: '',
    password: '',
    tenantName: '',
    tenantSlug: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  // Auto-gera slug do tenant name
  useEffect(() => {
    if (!slugEdited && formData.tenantName) {
      setFormData((prev) => ({
        ...prev,
        tenantSlug: generateSlug(formData.tenantName),
      }));
    }
  }, [formData.tenantName, slugEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações client-side
    if (formData.password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (!isValidSlug(formData.tenantSlug)) {
      setError('O domínio do escritório contém caracteres inválidos');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerAction(formData);

      if (result.success === false) {
        setError(result.error);
        return;
      }

      // Sucesso - mostra mensagem e redireciona
      setSuccess(true);
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('[RegisterForm] Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Marca slug como editado manualmente
    if (name === 'tenantSlug') {
      setSlugEdited(true);
    }

    // Limpa erro ao digitar
    if (error) setError('');
  };

  // Success State
  if (success) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Conta criada com sucesso!</h2>
          <p className="mb-4 text-gray-600">
            Enviamos um email de verificação para <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-500">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-600">Comece seu período de testes gratuito</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome Completo */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={isLoading}
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#1152d4] disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Email */}
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
                className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#1152d4] disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Nome do Escritório */}
          <div>
            <label htmlFor="tenantName" className="mb-2 block text-sm font-medium text-gray-700">
              Nome do Escritório
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="tenantName"
                name="tenantName"
                type="text"
                required
                disabled={isLoading}
                value={formData.tenantName}
                onChange={handleChange}
                placeholder="Ex: Advocacia Silva"
                className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#1152d4] disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Domínio do Escritório (Slug) */}
          <div>
            <label htmlFor="tenantSlug" className="mb-2 block text-sm font-medium text-gray-700">
              Link Personalizado
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="tenantSlug"
                name="tenantSlug"
                type="text"
                required
                disabled={isLoading}
                value={formData.tenantSlug}
                onChange={handleChange}
                placeholder="advocacia-silva"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#1152d4] disabled:bg-gray-50"
              />
            </div>
            <p className="mt-1 truncate pl-1 text-[10px] text-gray-500">
              {formData.tenantSlug ? `${formData.tenantSlug}.jurisnexo.com` : 'escolha-seu-link'}
            </p>
          </div>

          {/* Senha */}
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
                autoComplete="new-password"
                required
                disabled={isLoading}
                value={formData.password}
                onChange={handleChange}
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
              Confirmar Senha
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
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                Criando conta...
              </>
            ) : (
              'Criar Conta Gratuita'
            )}
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link href="/terms" className="text-[#1152d4] hover:underline">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link href="/privacy" className="text-[#1152d4] hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-[#1152d4] hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
