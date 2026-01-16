'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WhatsAppConversation } from '@/types/whatsapp';
import { ContactAvatar } from './ContactAvatar';
import { Bot } from 'lucide-react';

interface ConversationListItemProps {
    conversation: WhatsAppConversation;
    isSelected: boolean;
    onClick: () => void;
}

export function ConversationListItem({ conversation, isSelected, onClick }: ConversationListItemProps) {
    const lastMessage = conversation.messages?.[conversation.messages.length - 1];
    const time = conversation.lastCustomerMessageAt
        ? formatDistanceToNow(new Date(conversation.lastCustomerMessageAt), { locale: ptBR, addSuffix: false })
        : '';

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 flex gap-3 hover:bg-white dark:hover:bg-gray-800 transition-all border-b border-gray-100 dark:border-gray-700/50 text-left relative ${isSelected ? 'bg-white dark:bg-gray-800' : 'bg-transparent'
                }`}
        >
            <ContactAvatar
                name={conversation.customerName}
                status={isSelected ? 'online' : undefined}
                size="lg"
            />

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                        {conversation.customerName}
                    </h4>
                    <span className={`text-[10px] font-semibold whitespace-nowrap ml-2 ${conversation.messages?.some(m => !isOutboundStatus(m.status)) // Simplified unread detection
                            ? 'text-[#25D366]'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        {time}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                        {conversation.isBotEnabled && <Bot className="w-3 h-3 text-blue-500 shrink-0" />}
                        {lastMessage?.content || 'Sem mensagens'}
                    </p>
                    {/* Badge placeholder (unreadCount would be here in real data) */}
                </div>
            </div>

            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#25D366]" />}
        </button>
    );
}

// Helper (would usually be in a utils file)
function isOutboundStatus(status: any) {
    return status === 'Sent' || status === 'Delivered' || status === 'Read';
}
