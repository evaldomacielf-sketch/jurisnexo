'use client';

import { X, Calendar, User, Tag, Clock, Trash2, Edit, MessageSquare } from 'lucide-react';
import { useKanbanStore } from '@/lib/store/kanban-store';
import { CATEGORY_CONFIG } from '@/lib/types/kanban';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

// ============================================
// 📱 Case Detail Modal
// ============================================

export function CaseDetailModal() {
  const { selectedCard, selectCard, deleteCard } = useKanbanStore();

  if (!selectedCard) return null;

  const categoryConfig = CATEGORY_CONFIG[selectedCard.category];

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este caso?')) {
      deleteCard(selectedCard.id);
      selectCard(null);
      toast.success('Caso excluído com sucesso', { icon: '🗑️' });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm duration-200 animate-in fade-in"
        onClick={() => selectCard(null)}
      />

      {/* Modal */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="pointer-events-auto max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl duration-200 animate-in zoom-in-95 dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="min-w-0 flex-1 pr-4">
              <span
                className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryConfig.color} ${categoryConfig.bgColor} mb-3`}
              >
                {categoryConfig.label}
              </span>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCard.clientName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Caso #{selectedCard.id}</p>
            </div>
            <button
              onClick={() => selectCard(null)}
              aria-label="Fechar modal"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6">
            {/* Description */}
            <div className="mb-6">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <MessageSquare className="h-4 w-4" />
                Descrição
              </h3>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {selectedCard.description}
              </p>
            </div>

            {/* Info Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <p className="mb-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Tag className="h-3 w-3" />
                  Status
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedCard.status}
                </p>
              </div>

              {/* Priority */}
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <p className="mb-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  Prioridade
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedCard.priority || 'Normal'}
                </p>
              </div>

              {/* Last Update */}
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <p className="mb-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  Última Atualização
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {format(selectedCard.lastUpdate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              {/* Assigned To */}
              {selectedCard.assignedTo && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                  <p className="mb-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <User className="h-3 w-3" />
                    Responsável
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {selectedCard.assignedTo.initials}
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {selectedCard.assignedTo.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline (Placeholder) */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
                Linha do Tempo
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Caso criado</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {format(selectedCard.lastUpdate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-700/50">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Excluir Caso
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => selectCard(null)}
                className="rounded-lg px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Fechar
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-opacity-90">
                <Edit className="h-4 w-4" />
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
