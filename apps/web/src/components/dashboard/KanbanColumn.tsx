'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { SortableCaseCard } from './SortableCaseCard';
import { useKanbanStore } from '@/lib/store/kanban-store';
import type { KanbanColumn as KanbanColumnType } from '@/lib/types/kanban';

// ============================================
// 📊 Kanban Column with Droppable Area
// ============================================

interface KanbanColumnProps {
  column: KanbanColumnType;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { selectCard, openCreateModal } = useKanbanStore();
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
  });

  return (
    <div className="flex min-w-[260px] flex-1 flex-col gap-4">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            {column.title}
          </h4>
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold dark:bg-gray-700">
            {column.cards.length}
          </span>
        </div>
        <button
          onClick={() => openCreateModal(column.id)}
          className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800"
          title="Adicionar caso"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Droppable Area */}
      <SortableContext
        items={column.cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`max-h-[calc(100vh-280px)] min-h-[400px] flex-1 space-y-3 overflow-y-auto rounded-xl bg-gray-50/50 p-3 transition-colors dark:bg-gray-800/20 ${
            isOver ? 'bg-primary/5 ring-2 ring-primary' : ''
          }`}
        >
          {column.cards.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-400">
              {isOver ? 'Solte aqui' : 'Nenhum caso nesta coluna'}
            </div>
          ) : (
            column.cards.map((card) => (
              <SortableCaseCard key={card.id} card={card} onCardClick={() => selectCard(card)} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
