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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                if (data.token) {
                    document.cookie = `access_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
                }
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
            <Link href="/auth/login" className="inline-flex items-center text-[#4f5b76] hover:text-[#0A0E27] mb-6 text-sm transition-colors font-display">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para login
            </Link>

            <div className="mb-8">
                <h1 className="text-[#0A0E27] tracking-tight text-[32px] font-bold leading-tight mb-2 font-display">Verificar Código</h1>
                <p className="text-[#4f5b76] text-base font-normal leading-normal font-display">
                    Enviamos um código de 6 dígitos para <span className="text-[#0A0E27] font-medium">{email}</span>.
                </p>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-6">
                <div className="flex flex-col w-full">
                    <label className="flex flex-col w-full">
                        <p className="text-[#0A0E27] text-sm font-medium leading-normal pb-2 font-display">Código de Verificação</p>
                        <input
                            id="code"
                            type="text"
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={6}
                            className="flex w-full rounded-lg text-[#0A0E27] text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50 border border-slate-300 bg-white focus:border-[#1152d4] h-14 placeholder:text-slate-400/50 px-4 font-normal transition-all font-mono"
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
