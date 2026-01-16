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

    return (
        <div ref={setNodeRef} className="sortable-card" {...attributes} {...listeners}>
            <style jsx>{`
                .sortable-card {
                    transform: ${CSS.Transform.toString(transform)};
                    transition: ${transition};
                    opacity: ${isDragging ? 0.5 : 1};
                }
            `}</style>
            <CaseCard card={card} onCardClick={onCardClick} isDragging={isDragging} />
        </div>
    );
}
