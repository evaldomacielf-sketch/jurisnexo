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
        <div className="flex flex-col gap-4 flex-1 min-w-[260px]">
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {column.title}
                    </h4>
                    <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">
                        {column.cards.length}
                    </span>
                </div>
                <button
                    onClick={() => openCreateModal(column.id)}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    title="Adicionar caso"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Droppable Area */}
            <SortableContext
                items={column.cards.map((card) => card.id)}
                strategy={verticalListSortingStrategy}
            >
                <div
                    ref={setNodeRef}
                    className={`flex-1 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl p-3 space-y-3 overflow-y-auto min-h-[400px] max-h-[calc(100vh-280px)] transition-colors ${isOver ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                >
                    {column.cards.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                            {isOver ? 'Solte aqui' : 'Nenhum caso nesta coluna'}
                        </div>
                    ) : (
                        column.cards.map((card) => (
                            <SortableCaseCard
                                key={card.id}
                                card={card}
                                onCardClick={() => selectCard(card)}
                            />
                        ))
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
