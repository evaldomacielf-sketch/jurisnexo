export default function FinancialPage() {
  return (
    <div className="p-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-[#0A0E27] dark:text-white">
        Financeiro
      </h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Receita Total */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#2d3748] dark:bg-[#1c2230]">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                payments
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receita Total</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ 45.280,00</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+12.5% vs mês anterior</span>
          </div>
        </div>

        {/* Card 2: A Receber */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#2d3748] dark:bg-[#1c2230]">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                account_balance_wallet
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">A Receber</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ 12.450,00</h3>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">8 faturas pendentes</div>
        </div>

        {/* Card 3: Despesas */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#2d3748] dark:bg-[#1c2230]">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                trending_down
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Despesas</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ 8.320,00</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+4.2% vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Empty State / Coming Soon Area */}
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-[#2d3748] dark:bg-[#1c2230]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">
            construction
          </span>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Módulo Financeiro Completo em Breve
        </h3>
        <p className="mx-auto max-w-md text-gray-500 dark:text-gray-400">
          Estamos desenvolvendo funcionalidades avançadas para controle de honorários, fluxo de
          caixa e relatórios automáticos.
        </p>
      </div>
    </div>
  );
}
