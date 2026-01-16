import React from 'react';
import type { ConversationPriority } from '@/types/inbox';

interface UrgencyBadgeProps {
  urgency: ConversationPriority;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency }) => {
  const styles: Record<ConversationPriority, string> = {
    normal: 'bg-slate-100 text-slate-600 border-slate-200',
    high: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    urgent: 'bg-red-100 text-red-700 border-red-200 animate-pulse font-bold',
    low: 'bg-green-100 text-green-700 border-green-200',
  };

  const labels: Record<ConversationPriority, string> = {
    normal: 'Normal',
    high: 'Alta',
    urgent: '🚨 URGENTE 🚨',
    low: 'Baixa',
  };

  return (
    <span className={`rounded-full border px-2 py-1 text-xs ${styles[urgency] || styles.normal}`}>
      {labels[urgency] || urgency}
    </span>
  );
};
