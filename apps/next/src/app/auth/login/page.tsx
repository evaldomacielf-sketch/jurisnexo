'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push('/tenants');
            } else {
                const data = await res.json();
                setError(data.message || 'Email ou senha inválidos.');
            }
        } catch (err) {
            console.error(err);
            setError('Erro de conexão com o servidor.');
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

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

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

                <div className="flex flex-col w-full">
                    <label className="flex flex-col w-full">
                        <p className="text-[#0A0E27] text-sm font-medium leading-normal pb-2 font-display">Senha</p>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex w-full rounded-lg !text-[#0A0E27] text-[#0A0E27] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50 border border-slate-300 !bg-white bg-white focus:border-[#1152d4] h-14 placeholder:text-slate-400 px-4 pr-12 text-base font-normal transition-all shadow-sm box-border appearance-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg h-14 bg-[#1152d4] text-white text-base font-bold transition-all hover:bg-[#0e44b1] active:scale-[0.98] font-display disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Entrando...
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
