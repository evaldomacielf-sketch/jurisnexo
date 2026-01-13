'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { forgotPasswordAction } from '@/actions/auth';

// ============================================
// 📧 Forgot Password Form Component
// ============================================

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await forgotPasswordAction({ email });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setSuccess(true);
        } catch (err) {
            setError('Erro inesperado. Tente novamente.');
            console.error('[ForgotPassword] Unexpected error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Success State
    if (success) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Email Enviado!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Verifique sua caixa de entrada e spam.
                        </p>
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-2 text-[#1152d4] hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Esqueceu sua senha?
                    </h1>
                    <p className="text-gray-600">
                        Digite seu email e enviaremos um link para redefinir sua senha
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
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="seu@email.com"
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1152d4] focus:border-transparent outline-none transition disabled:bg-gray-50"
                            />
                        </div>
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
                                Enviando...
                            </>
                        ) : (
                            'Enviar Link de Recuperação'
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1152d4]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para login
                    </Link>
                </div>
            </div>
        </div>
    );
}
