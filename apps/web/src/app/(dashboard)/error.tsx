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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Algo deu errado</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Ocorreu um erro ao carregar o dashboard.
        </p>
        <button
          onClick={reset}
          className="mb-3 w-full rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
        >
          Tentar Novamente
        </button>
        <a
          href="/login"
          className="block w-full rounded-lg px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Voltar ao Login
        </a>
      </div>
    </div>
  );
}
