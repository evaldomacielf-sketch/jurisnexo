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
                    router.push('/auth/login?verified=true');
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
                <Loader2 className="w-12 h-12 text-[#1152d4] animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Verificando seu email...</h2>
                <p className="text-gray-500 mt-2">Aguarde um momento</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verificado!</h2>
                <p className="text-gray-600 mb-6">Sua conta foi ativada com sucesso.</p>
                <p className="text-sm text-gray-500">Redirecionando para login...</p>
                <Link href="/auth/login" className="mt-4 inline-flex items-center text-[#1152d4] hover:underline">
                    Ir para Login <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Falha na Verificação</h2>
                <p className="text-red-600 mb-6">{message}</p>

                <div className="flex flex-col gap-3">
                    <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm">
                        Voltar para Login
                    </Link>
                    {email && (
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="text-[#1152d4] hover:underline text-sm disabled:opacity-50"
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-[#1152d4]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifique seu Email</h2>
            <p className="text-gray-600 mb-6">
                Enviamos um link de confirmação para <strong>{email}</strong>.
                <br />Por favor, clique no link para ativar sua conta.
            </p>
            <div className="text-sm text-gray-500">
                <p>Não recebeu?</p>
                <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-[#1152d4] hover:underline mt-1 disabled:opacity-50"
                >
                    {resending ? 'Reenviando...' : 'Clique para reenviar'}
                </button>
            </div>
            <Link href="/auth/login" className="block mt-6 text-sm text-gray-600 hover:text-gray-900">
                Voltar para Login
            </Link>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <Suspense fallback={<div className="text-center">Carregando...</div>}>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}
