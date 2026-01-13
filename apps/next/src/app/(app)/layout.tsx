import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { getCurrentUser } from '@/lib/auth/session';
import { Suspense } from 'react';

// ============================================
// 🔐 Protected Dashboard Layout (CORRIGIDO)
// ============================================

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // CRÍTICO: Adicionar try-catch para evitar loops
    let user;
    try {
        user = await getCurrentUser();
    } catch (error) {
        console.error('[Layout] Error fetching user:', error);
        redirect('/auth/login?error=session_error');
    }

    // CRÍTICO: Redirecionar APENAS se não houver middleware
    if (!user) {
        redirect('/auth/login?redirect=/dashboard');
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar com Suspense para evitar problemas de hidratação */}
            <Suspense fallback={<SidebarSkeleton />}>
                <Sidebar user={user} tenantName="Silva & Associados" />
            </Suspense>

            {/* Main Content */}
            <div className="ml-64 flex-1 transition-all duration-300">
                <Suspense fallback={<DashboardSkeleton />}>
                    {children}
                </Suspense>
            </div>
        </div>
    );
}

// Skeleton Components
function SidebarSkeleton() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="p-6">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        </aside>
    );
}

function DashboardSkeleton() {
    return (
        <div className="p-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    );
}
