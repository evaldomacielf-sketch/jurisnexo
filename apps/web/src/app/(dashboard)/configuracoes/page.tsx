'use client';

import { usePlan } from '@/hooks/usePlan';

export default function SettingsPage() {
  const { isFeatureEnabled, plan } = usePlan();

  return (
    <div className="font-display p-8">
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Configurações</h1>

      {/* Custom Keywords Feature */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a2130]">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold dark:text-white">
              <span className="material-symbols-outlined text-blue-600">manage_search</span>
              Palavras-chave Personalizadas
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Defina termos específicos para monitoramento automático de novos processos.
            </p>
          </div>
        </div>

        <div className="mt-2">
          {isFeatureEnabled('KEYWORDS_CUSTOM') ? (
            <div className="animate-fade-in space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: 'Dano Moral', 'Ricardo Silva'..."
                  className="h-10 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button className="rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700">
                  Adicionar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  Dano Moral <button className="hover:text-red-500">×</button>
                </span>
              </div>
            </div>
          ) : (
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-[#151b26]">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                  <span className="material-symbols-outlined text-gray-400">lock</span>
                </div>
                <h3 className="mb-1 font-bold text-gray-900 dark:text-white">Recurso Bloqueado</h3>
                <p className="mx-auto mb-6 max-w-sm text-sm text-gray-500">
                  A personalização de palavras-chave não está disponível no seu plano atual{' '}
                  <span className="rounded bg-gray-200 px-1 font-mono text-xs dark:bg-gray-700">
                    {plan?.plan?.toUpperCase()}
                  </span>
                  .
                </p>
                <button className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700">
                  Fazer Upgrade para PRO
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
