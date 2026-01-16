'use client';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { KanbanColumn } from './KanbanColumn';
import { CaseCard } from './CaseCard';
import { CaseDetailModal } from './CaseDetailModal';
import { CreateCaseModal } from './CreateCaseModal';
import { useKanbanStore } from '@/lib/store/kanban-store';
import type { CaseCard as CaseCardType } from '@/lib/types/kanban';

// ============================================
// 🎯 Kanban Board with Drag & Drop
// ============================================

export function KanbanBoard() {
  const { columns, moveCard, searchQuery, filterCategory, filterPriority } = useKanbanStore();
  const [activeCard, setActiveCard] = useState<CaseCardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtrar cards
  const getFilteredCards = (cards: CaseCardType[]) => {
    return cards.filter((card) => {
      const matchesSearch =
        !searchQuery ||
        card.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !filterCategory || card.category === filterCategory;

      const matchesPriority = !filterPriority || card.priority === filterPriority;

      return matchesSearch && matchesCategory && matchesPriority;
    });
  };

  const filteredColumns = columns.map((col) => ({
    ...col,
    cards: getFilteredCards(col.cards),
  }));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = columns.flatMap((col) => col.cards).find((c) => c.id === active.id);

    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeCard = columns.flatMap((col) => col.cards).find((c) => c.id === active.id);

    if (!activeCard) {
      setActiveCard(null);
      return;
    }

    // Identifica a coluna de destino
    const overColumnId = over.id.toString().startsWith('column-')
      ? over.id.toString().replace('column-', '')
      : columns.find((col) => col.cards.some((card) => card.id === over.id))?.id;

    if (overColumnId && activeCard.status !== overColumnId) {
      moveCard(activeCard.id, activeCard.status, overColumnId as any);
      toast.success(`Caso movido para ${overColumnId}`, {
        icon: '✅',
        duration: 2000,
      });
    }

    setActiveCard(null);
  };

  return (
    <div className="flex h-full flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full min-h-[600px] gap-6 overflow-x-auto pb-8">
          {filteredColumns.map((column) => (
            <KanbanColumn key={column.id} column={column} />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="rotate-3 opacity-90">
              <CaseCard card={activeCard} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <CaseDetailModal />
      <CreateCaseModal />
    </div>
  );
}
