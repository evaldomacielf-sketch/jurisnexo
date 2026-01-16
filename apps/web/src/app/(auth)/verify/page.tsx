'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { verifyEmailAction, resendVerificationAction } from '@/actions/auth';

// ============================================
// ✅ Verify Email Component
// ============================================

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email'); // Optional, for resend

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else if (email) {
      setStatus('idle'); // Just showing "Please check your email"
    } else {
      setStatus('error');
      setMessage('Token de verificação inválido ou ausente.');
    }
  }, [token, email]);

  const verifyToken = async (token: string) => {
    setStatus('loading');
    try {
      const result = await verifyEmailAction(token);

      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Erro ao verificar email.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Erro inesperado ao verificar email.');
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const result = await resendVerificationAction(email);
      if (result.success) {
        alert('Email de verificação reenviado!');
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Erro ao reenviar email.');
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#1152d4]" />
        <h2 className="text-xl font-semibold text-gray-900">Verificando seu email...</h2>
        <p className="mt-2 text-gray-500">Aguarde um momento</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Email Verificado!</h2>
        <p className="mb-6 text-gray-600">Sua conta foi ativada com sucesso.</p>
        <p className="text-sm text-gray-500">Redirecionando para login...</p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center text-[#1152d4] hover:underline"
        >
          Ir para Login <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Falha na Verificação</h2>
        <p className="mb-6 text-red-600">{message}</p>

        <div className="flex flex-col gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Voltar para Login
          </Link>
          {email && (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-[#1152d4] hover:underline disabled:opacity-50"
            >
              {resending ? 'Reenviando...' : 'Reenviar email de verificação'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Idle state (e.g. user just registered and was redirected here with ?email=...)
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Loader2 className="h-8 w-8 text-[#1152d4]" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">Verifique seu Email</h2>
      <p className="mb-6 text-gray-600">
        Enviamos um link de confirmação para <strong>{email}</strong>.
        <br />
        Por favor, clique no link para ativar sua conta.
      </p>
      <div className="text-sm text-gray-500">
        <p>Não recebeu?</p>
        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-1 text-[#1152d4] hover:underline disabled:opacity-50"
        >
          {resending ? 'Reenviando...' : 'Clique para reenviar'}
        </button>
      </div>
      <Link href="/login" className="mt-6 block text-sm text-gray-600 hover:text-gray-900">
        Voltar para Login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <Suspense fallback={<div className="text-center">Carregando...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
