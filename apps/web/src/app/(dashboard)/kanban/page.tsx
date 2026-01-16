import { Header } from '@/components/dashboard/Header';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { KanbanFilters } from '@/components/dashboard/KanbanFilters';
import { WhatsAppSidebar } from '@/components/dashboard/WhatsAppSidebar';
import { CaseDetailModal } from '@/components/dashboard/CaseDetailModal';
import { Toaster } from 'react-hot-toast';

// ============================================
// 📋 Kanban Dashboard Page (Completa)
// ============================================

export const metadata = {
  title: 'Kanban - Dashboard | JurisNexo',
  description: 'Gestão de casos em formato Kanban com Drag & Drop',
};

export default function KanbanPage() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1152d4',
            color: '#fff',
          },
        }}
      />

      <div className="flex h-screen overflow-hidden">
        {/* Main Content */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
          <Header showSearch={false} />

          <div className="flex-1 overflow-y-auto p-8">
            <KanbanFilters />
            <KanbanBoard />
          </div>
        </main>

        {/* WhatsApp Sidebar */}
        <WhatsAppSidebar />
      </div>

      {/* Case Detail Modal */}
      <CaseDetailModal />
    </>
  );
}
