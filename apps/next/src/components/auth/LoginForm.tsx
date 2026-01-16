'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { loginAction } from '@/actions/auth';
import type { LoginDTO } from '@/lib/auth/types';

// ============================================
// 🔐 Login Form Component
// ============================================

export function LoginForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginDTO>({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await loginAction(formData);

            if (!result.success) {
                setError(result.error);
                console.error('[LoginForm] Login failure:', result.error, 'Code:', result.code);
                return;
            }

            // Sucesso - redireciona para dashboard
            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            setError('Erro inesperado. Tente novamente.');
            console.error('[LoginForm] Unexpected error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        // Limpa erro ao digitar
        if (error) setError('');
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Bem-vindo ao JurisNexo
                    </h1>
                    <p className="text-gray-600">
                        Faça login para acessar sua conta
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1152d4] focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                disabled={isLoading}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1152d4] focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end">
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm text-[#1152d4] hover:underline"
                        >
                            Esqueceu sua senha?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#1152d4] text-white py-3 rounded-lg font-medium hover:bg-[#0d3fa3] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Não tem uma conta?{' '}
                        <Link
                            href="/auth/register"
                            className="text-[#1152d4] font-medium hover:underline"
                        >
                            Cadastre-se gratuitamente
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
