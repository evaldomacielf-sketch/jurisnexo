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
            className={`bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:border-primary hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${isDragging ? 'shadow-2xl scale-105' : ''
                }`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${categoryConfig.color} ${categoryConfig.bgColor}`}
                >
                    {categoryConfig.label}
                </span>
                <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Open context menu
                    }}
                >
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Client Name */}
            <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {card.clientName}
            </h5>

            {/* Description */}
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {card.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
                {/* Avatar/Initials */}
                {card.assignedTo && (
                    <div
                        className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300"
                        title={card.assignedTo.name}
                    >
                        {card.assignedTo.initials}
                    </div>
                )}

                {/* Status/Time */}
                {card.priority === 'URGENT' ? (
                    <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase tracking-tight">
                        <AlertCircle className="w-3 h-3" />
                        Urgente
                    </div>
                ) : (
                    <div className={`flex items-center gap-1 text-[10px] ${timeInfo.color}`}>
                        <TimeIcon className="w-3 h-3" />
                        {timeInfo.text}
                    </div>
                )}
            </div>
        </div>
    );
}
