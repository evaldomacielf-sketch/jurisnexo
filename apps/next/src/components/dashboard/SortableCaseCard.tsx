'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CaseCard } from './CaseCard';
import type { CaseCard as CaseCardType } from '@/lib/types/kanban';

// ============================================
// 🎴 Sortable Case Card (Drag & Drop)
// ============================================

interface SortableCaseCardProps {
    card: CaseCardType;
    onCardClick?: (card: CaseCardType) => void;
}

export function SortableCaseCard({ card, onCardClick }: SortableCaseCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id });

    // Styles must remain inline for dnd-kit transform and transition dynamics
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <CaseCard card={card} onCardClick={onCardClick} isDragging={isDragging} />
        </div>
    );
}
