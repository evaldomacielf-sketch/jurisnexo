// ============================================
// ⏳ Dashboard Loading State
// ============================================

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
            </div>
        </div>
    );
}
