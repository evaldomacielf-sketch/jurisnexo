'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Dashboard] Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Algo deu errado
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Ocorreu um erro ao carregar o dashboard.
                </p>
                <button
                    onClick={reset}
                    className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition mb-3"
                >
                    Tentar Novamente
                </button>
                <a
                    href="/login"
                    className="block w-full text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                    Voltar ao Login
                </a>
            </div>
        </div>
    );
}
