import React, { useState } from 'react';
import { UrgencyBadge } from './UrgencyBadge';
import type { Conversation, ConversationPriority } from '@/types/inbox';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'URGENT'>('ALL');

  const filtered = conversations.filter((c) => filter === 'ALL' || c.priority === 'urgent');

  return (
    <div className="flex h-full w-80 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <h2 className="mb-2 text-lg font-bold text-slate-800">Inbox</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('URGENT')}
            className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              filter === 'URGENT'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            🚨 Urgentes
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-400">Nenhuma conversa encontrada.</div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 ${
                selectedId === conv.id
                  ? 'border-l-4 border-l-blue-500 bg-blue-50'
                  : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="mb-1 flex items-start justify-between">
                <span className="truncate pr-2 font-semibold text-slate-800">
                  {conv.contact.name || conv.contact.phone}
                </span>
                <UrgencyBadge urgency={conv.priority} />
              </div>
              <p className="mb-1 truncate text-xs text-slate-500">
                {conv.last_message?.content || 'Nova conversa'}
              </p>
              <div className="text-[10px] text-slate-400">
                {conv.last_message ? new Date(conv.last_message.sent_at).toLocaleDateString() : ''}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
