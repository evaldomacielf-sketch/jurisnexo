'use client';

import { WhatsAppConversation } from '@/types/whatsapp';
import { ConversationListItem } from './ConversationListItem';

interface ConversationListProps {
    conversations: WhatsAppConversation[] | undefined;
    selectedId: string | null;
    onSelect: (id: string) => void;
    isLoading: boolean;
}

export default function ConversationList({ conversations, selectedId, onSelect, isLoading }: ConversationListProps) {
    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!conversations || conversations.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-gray-500">
                <p>Nenhuma conversa encontrada</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.map(conv => (
                <ConversationListItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={selectedId === conv.id}
                    onClick={() => onSelect(conv.id)}
                />
            ))}
        </div>
    );
}
