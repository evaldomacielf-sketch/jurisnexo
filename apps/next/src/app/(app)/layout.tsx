import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { getCurrentUser } from '@/lib/auth/session';
import { Suspense } from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('[Layout] Error fetching user:', error);
    redirect('/auth/login?error=session_error');
  }

  if (!user) {
    redirect('/auth/login?redirect=/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar user={user} tenantName="Silva & Associados" />
      </Suspense>

      <div className="ml-64 flex-1 transition-all duration-300">
        <Suspense fallback={<DashboardSkeleton />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="p-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </aside>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3 animate-pulse"></div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
  );
}
