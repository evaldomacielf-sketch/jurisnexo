'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerifyForm() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:4000/api/auth/exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            if (res.ok) {
                // Check for tenants to redirect
                // For now, simple redirect to dashboard, middleware/page logic will handle the rest
                router.push('/dashboard');
            } else {
                alert('Código inválido ou expirado.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <Link href="/auth/login" className="inline-flex items-center text-gray-400 hover:text-white mb-6 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para login
            </Link>

            <h1 className="text-3xl font-bold text-white mb-2">Verificar Código</h1>
            <p className="text-gray-400 mb-8">
                Enviamos um código de 6 dígitos para <span className="text-white font-medium">{email}</span>.
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300" htmlFor="code">
                        Código de Verificação
                    </label>
                    <input
                        id="code"
                        type="text"
                        placeholder="000000"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        maxLength={6}
                        className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Verificando...
                        </>
                    ) : (
                        'Validar e Entrar'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    className="text-sm text-blue-500 hover:text-blue-400 hover:underline"
                    onClick={() => alert('Reenviar código não implementado na demo')}
                >
                    Não recebeu o código? Reenviar
                </button>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="text-white">Carregando...</div>}>
            <VerifyForm />
        </Suspense>
    );
}
