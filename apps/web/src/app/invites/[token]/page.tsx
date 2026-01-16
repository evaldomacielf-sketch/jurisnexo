'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthShell } from '@/components/layout/AuthShell';
import Link from 'next/link';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState('');

  // Register Form State
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) fetchInvite();
  }, [token]);

  const fetchInvite = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/tenants/invites/${token}`);
      if (!res.ok) throw new Error('Convite inválido ou expirado');
      const data = await res.json();
      setInvite(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptExisting = async () => {
    setSubmitting(true);
    try {
      // User must be logged in.
      // In a real app we'd check session here.
      // If API returns 401/400, redirects to login?
      // "Se usuário já existe...".
      // Since we don't have global session context here easily without a provider hook:
      // Let's assume user is logged in if they click "Aceitar".
      // If fetch fails with 401, redirect to login.

      const res = await fetch('http://localhost:5000/api/tenants/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });

      if (res.ok) {
        await res.json();
        router.push('/dashboard'); // Or switch tenant context?
      } else {
        if (res.status === 401) {
          alert('Por favor, faça login primeiro.');
          router.push('/login?redirect=/invites/' + token);
        } else {
          const err = await res.json();
          alert(err.message || 'Falha ao aceitar');
        }
      }
    } catch (e) {
      alert('Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert('Senhas não conferem');

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, fullName, password }),
        credentials: 'include',
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const err = await res.json();
        alert(err.message || 'Erro ao registrar');
      }
    } catch (e) {
      alert('Erro ao registrar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <AuthShell>
        <div className="flex justify-center p-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            progress_activity
          </span>
        </div>
      </AuthShell>
    );

  if (error)
    return (
      <AuthShell>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <span className="material-symbols-outlined mb-4 text-4xl text-red-500">error</span>
          <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-400">
            Convite Inválido
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{error}</p>
          <Link href="/login" className="font-bold text-primary hover:underline">
            Ir para Login
          </Link>
        </div>
      </AuthShell>
    );

  return (
    <AuthShell>
      <div className="w-full">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
            <span className="material-symbols-outlined text-3xl">mail</span>
          </span>
          <h1 className="mb-2 text-2xl font-black text-[#111318] dark:text-white">
            Convite para Equipe
          </h1>
          <p className="text-[#616f89]">
            Você foi convidado para participar do escritório
            <br />
            <strong className="text-lg text-[#111318] dark:text-white">{invite.tenantName}</strong>
          </p>
        </div>

        {invite.userExists ? (
          <div className="rounded-xl border border-[#dbdfe6] bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-[#1c222d]">
            <p className="mb-6 text-sm text-[#616f89]">
              Encontramos uma conta existente para <strong>{invite.email}</strong>.
            </p>
            <button
              onClick={handleAcceptExisting}
              disabled={submitting}
              className="h-12 w-full rounded-xl bg-primary font-bold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Entrando...' : 'Aceitar e Entrar'}
            </button>
            <p className="mt-4 text-xs text-[#616f89]">
              Não é você?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Fazer login com outra conta
              </Link>
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#dbdfe6] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#1c222d]">
            <h3 className="mb-4 font-bold text-[#111318] dark:text-white">Criar sua conta</h3>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#616f89]">
                  Nome Completo
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#dbdfe6] bg-gray-50 px-4 text-[#111318] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-[#101622] dark:text-white"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#616f89]">
                  E-mail
                </label>
                <input
                  disabled
                  title="E-mail do convidado"
                  type="email"
                  value={invite.email}
                  className="h-11 w-full cursor-not-allowed rounded-lg border border-[#dbdfe6] bg-gray-100 px-4 text-gray-500 dark:border-gray-600 dark:bg-[#1a202a]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#616f89]">
                  Senha
                </label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#dbdfe6] bg-gray-50 px-4 text-[#111318] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-[#101622] dark:text-white"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#616f89]">
                  Confirmar Senha
                </label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#dbdfe6] bg-gray-50 px-4 text-[#111318] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-[#101622] dark:text-white"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 h-12 w-full rounded-xl bg-primary font-bold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'Criando conta...' : 'Criar Conta e Aceitar'}
              </button>
            </form>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
