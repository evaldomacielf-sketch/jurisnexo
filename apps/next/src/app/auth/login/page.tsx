'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:4001/api/auth/request-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                // Encode email to pass to verify page
                router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
            } else {
                alert('Erro ao solicitar código. Verifique o email.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Headline */}
            <div className="mb-8">
                <h1 className="!text-[#0A0E27] text-[#0A0E27] tracking-tight text-[32px] font-bold leading-tight mb-2 font-display">Acesse sua conta</h1>
                <p className="text-[#4f5b76] text-base font-normal leading-normal font-display">Bem-vindo de volta ao futuro da gestão jurídica.</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col w-full">
                    <label className="flex flex-col w-full">
                        <p className="text-[#0A0E27] text-sm font-medium leading-normal pb-2 font-display">E-mail</p>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex w-full rounded-lg !text-[#0A0E27] text-[#0A0E27] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50 border border-slate-300 !bg-white bg-white focus:border-[#1152d4] h-14 placeholder:text-slate-400 px-4 text-base font-normal transition-all shadow-sm box-border appearance-none"
                            required
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg h-14 bg-[#1152d4] text-white text-base font-bold transition-all hover:bg-[#0e44b1] active:scale-[0.98] font-display"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Enviando...
                        </>
                    ) : (
                        'Entrar'
                    )}
                </button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                    <span className="bg-[#f6f6f8] px-2 text-[#4f5b76] font-display">Ou</span>
                </div>
            </div>

            <div className="text-center">
                <p className="text-[#4f5b76] text-sm font-display">
                    Ainda não tem uma conta?{' '}
                    <Link href="/auth/register" className="text-[#1152d4] font-bold hover:underline ml-1">
                        Criar conta gratuita
                    </Link>
                </p>
            </div>
        </>
    );
}
