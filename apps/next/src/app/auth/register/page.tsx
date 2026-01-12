'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Reusing the same request-code endpoint as it handles creation implicitly
            const res = await fetch('http://localhost:4000/api/auth/request-code', {
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
                alert('Erro ao solicitar criação de conta. Tente novamente.');
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
            <h1 className="text-3xl font-bold text-white mb-2">Crie sua conta</h1>
            <p className="text-gray-400 mb-8">Comece agora a transformar seu escritório.</p>

            <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300" htmlFor="email">
                        E-mail Profissional
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="seu@advogado.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        required
                    />
                </div>

                <div className="text-xs text-gray-500">
                    Ao criar uma conta, você concorda com nossos{' '}
                    <a href="#" className="underline hover:text-gray-400">Termos de Uso</a> e{' '}
                    <a href="#" className="underline hover:text-gray-400">Política de Privacidade</a>.
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Criando conta...
                        </>
                    ) : (
                        'Criar conta grátis'
                    )}
                </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-800"></div>
                <span className="text-gray-500 text-sm">OU</span>
                <div className="h-px flex-1 bg-gray-800"></div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                    Já tem uma conta?{' '}
                    <Link href="/auth/login" className="text-blue-500 hover:text-blue-400 hover:underline">
                        Fazer login
                    </Link>
                </p>
            </div>
        </div>
    );
}
