import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { getCurrentUser } from '@/lib/auth/session';

// ============================================
// 🔐 Protected Dashboard Layout (Atualizado)
// ============================================

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    console.log('[DashboardLayout] Checking current user...');
    const user = await getCurrentUser();
    console.log('[DashboardLayout] User result:', user ? `Found (${user.email})` : 'Not found');

    if (!user) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <Sidebar user={user} tenantName="Silva & Associados" />

            {/* Main Content */}
            <div className="flex-1 transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
