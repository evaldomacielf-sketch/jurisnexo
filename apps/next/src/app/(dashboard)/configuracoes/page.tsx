'use client';

import { usePlan } from '@/hooks/usePlan';

export default function SettingsPage() {
    const { isFeatureEnabled, plan } = usePlan();

    return (
        <div className="p-8 font-display">
            <h1 className="text-2xl font-bold dark:text-white mb-6">Configurações</h1>

            {/* Custom Keywords Feature */}
            <div className="p-6 bg-white dark:bg-[#1a2130] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">manage_search</span>
                            Palavras-chave Personalizadas
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Defina termos específicos para monitoramento automático de novos processos.</p>
                    </div>
                </div>

                <div className="mt-2">
                    {isFeatureEnabled('KEYWORDS_CUSTOM') ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ex: 'Dano Moral', 'Ricardo Silva'..."
                                    className="flex-1 h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg font-bold text-sm transition-colors">
                                    Adicionar
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                                    Dano Moral <button className="hover:text-red-500">×</button>
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#151b26] p-8 text-center group">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-gray-400">lock</span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Recurso Bloqueado</h3>
                                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                                    A personalização de palavras-chave não está disponível no seu plano atual <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">{plan?.plan?.toUpperCase()}</span>.
                                </p>
                                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
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
