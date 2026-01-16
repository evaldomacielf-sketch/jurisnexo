'use client';

import { MoreHorizontal, Clock, AlertCircle, Calendar } from 'lucide-react';
import type { CaseCard as CaseCardType } from '@/lib/types/kanban';
import { CATEGORY_CONFIG } from '@/lib/types/kanban';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================
// 🎴 Case Card Component (Atualizado)
// ============================================

interface CaseCardProps {
  card: CaseCardType;
  onCardClick?: (card: CaseCardType) => void;
  isDragging?: boolean;
}

export function CaseCard({ card, onCardClick, isDragging = false }: CaseCardProps) {
  const categoryConfig = CATEGORY_CONFIG[card.category];

  const getTimeLabel = () => {
    const now = new Date();
    const isFuture = card.lastUpdate > now;

    if (isFuture) {
      return {
        icon: Calendar,
        text: formatDistanceToNow(card.lastUpdate, { locale: ptBR, addSuffix: false }),
        color: 'text-gray-600',
      };
    }

    return {
      icon: Clock,
      text: formatDistanceToNow(card.lastUpdate, { locale: ptBR, addSuffix: true }),
      color: 'text-gray-600',
    };
  };

  const timeInfo = getTimeLabel();
  const TimeIcon = timeInfo.icon;

  return (
    <div
      onClick={() => !isDragging && onCardClick?.(card)}
      className={`group cursor-grab rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary hover:shadow-md active:cursor-grabbing dark:border-gray-700 dark:bg-gray-800 ${
        isDragging ? 'scale-105 shadow-2xl' : ''
      }`}
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryConfig.color} ${categoryConfig.bgColor}`}
        >
          {categoryConfig.label}
        </span>
        <button
          className="rounded p-1 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-700"
          aria-label="Mais opções"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open context menu
          }}
        >
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Client Name */}
      <h5 className="mb-1 text-sm font-bold text-gray-900 dark:text-white">{card.clientName}</h5>

      {/* Description */}
      <p className="mb-3 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
        {card.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Avatar/Initials */}
        {card.assignedTo && (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            title={card.assignedTo.name}
          >
            {card.assignedTo.initials}
          </div>
        )}

        {/* Status/Time */}
        {card.priority === 'URGENT' ? (
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight text-red-500">
            <AlertCircle className="h-3 w-3" />
            Urgente
          </div>
        ) : (
          <div className={`flex items-center gap-1 text-[10px] ${timeInfo.color}`}>
            <TimeIcon className="h-3 w-3" />
            {timeInfo.text}
          </div>
        )}
      </div>
    </div>
  );
}
