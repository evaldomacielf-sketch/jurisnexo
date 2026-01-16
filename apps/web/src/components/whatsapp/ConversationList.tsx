import React from 'react';
import { WhatsAppConversation } from '@/types/whatsapp';

interface ConversationListProps {
    conversations?: WhatsAppConversation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    isLoading: boolean;
}

export default function ConversationList({
    conversations,
    selectedId,
    onSelect,
    isLoading
}: ConversationListProps) {
    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">Carregando...</div>;
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {conversations?.map((conv) => (
                <div
                    key={conv.id}
                    onClick={() => onSelect(conv.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedId === conv.id ? 'bg-green-50' : ''
                        }`}
                >
                    <div className="flex justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{conv.customerName || conv.customerPhone}</h3>
                        {conv.lastMessageAt && (
                            <span className="text-xs text-gray-500">
                                {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <p className="text-sm text-gray-600 truncate max-w-[200px]">
                            {conv.lastMessage || 'Nova conversa'}
                        </p>
                        {conv.unreadCount > 0 && (
                            <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                                {conv.unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            ))}
            {conversations?.length === 0 && (
                <div className="p-4 text-center text-gray-500">Nenhuma conversa encontrada.</div>
            )}
        </div>
    );
}
