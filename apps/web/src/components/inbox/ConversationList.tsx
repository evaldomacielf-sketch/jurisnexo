import React, { useState } from 'react';
import { UrgencyBadge } from './UrgencyBadge';
import type { Conversation, ConversationPriority } from '@/types/inbox';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedId, onSelect }) => {
    const [filter, setFilter] = useState<'ALL' | 'URGENT'>('ALL');

    const filtered = conversations.filter(c => filter === 'ALL' || c.priority === 'urgent');

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 w-80">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-2">Inbox</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`flex-1 py-1 px-2 text-xs rounded-md font-medium transition-colors ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('URGENT')}
                        className={`flex-1 py-1 px-2 text-xs rounded-md font-medium transition-colors ${filter === 'URGENT' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                    >
                        🚨 Urgentes
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-sm">
                        Nenhuma conversa encontrada.
                    </div>
                ) : (
                    filtered.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-slate-800 truncate pr-2">{conv.contact.name || conv.contact.phone}</span>
                                <UrgencyBadge urgency={conv.priority} />
                            </div>
                            <p className="text-xs text-slate-500 truncate mb-1">
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
