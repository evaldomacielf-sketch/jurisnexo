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
                credentials: 'include',
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
            <Link href="/auth/login" className="inline-flex items-center text-[#9da6b9] hover:text-white mb-6 text-sm transition-colors font-display">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para login
            </Link>

            <div className="mb-8">
                <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight mb-2 font-display">Verificar Código</h1>
                <p className="text-[#9da6b9] text-base font-normal leading-normal font-display">
                    Enviamos um código de 6 dígitos para <span className="text-white font-medium">{email}</span>.
                </p>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-6">
                <div className="flex flex-col w-full">
                    <label className="flex flex-col w-full">
                        <p className="text-white text-sm font-medium leading-normal pb-2 font-display">Código de Verificação</p>
                        <input
                            id="code"
                            type="text"
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={6}
                            className="form-input flex w-full rounded-lg text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50 border border-[#3b4354] bg-[#1c2230] focus:border-[#1152d4] h-14 placeholder:text-[#9da6b9]/20 px-4 font-normal transition-all font-mono"
                            required
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center rounded-lg h-14 bg-[#1152d4] text-white text-base font-bold transition-all hover:bg-[#0e44b1] active:scale-[0.98] font-display"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Verificando...
                        </>
                    ) : (
                        'Validar e Entrar'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    className="text-sm text-[#1152d4] font-bold hover:underline font-display"
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
