export default function FinancialPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-[#0A0E27] dark:text-white mb-6 font-display">
                Financeiro
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card 1: Receita Total */}
                <div className="bg-white dark:bg-[#1c2230] p-6 rounded-xl border border-slate-200 dark:border-[#2d3748] shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400">payments</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Receita Total</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ 45.280,00</h3>
                        </div>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        <span>+12.5% vs mês anterior</span>
                    </div>
                </div>

                {/* Card 2: A Receber */}
                <div className="bg-white dark:bg-[#1c2230] p-6 rounded-xl border border-slate-200 dark:border-[#2d3748] shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">account_balance_wallet</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">A Receber</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ 12.450,00</h3>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        8 faturas pendentes
                    </div>
                </div>

                {/* Card 3: Despesas */}
                <div className="bg-white dark:bg-[#1c2230] p-6 rounded-xl border border-slate-200 dark:border-[#2d3748] shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400">trending_down</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Despesas</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ 8.320,00</h3>
                        </div>
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        <span>+4.2% vs mês anterior</span>
                    </div>
                </div>
            </div>

            {/* Empty State / Coming Soon Area */}
            <div className="bg-white dark:bg-[#1c2230] p-12 rounded-xl border border-slate-200 dark:border-[#2d3748] text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">construction</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Módulo Financeiro Completo em Breve</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Estamos desenvolvendo funcionalidades avançadas para controle de honorários, fluxo de caixa e relatórios automáticos.
                </p>
            </div>
        </div>
    );
}
