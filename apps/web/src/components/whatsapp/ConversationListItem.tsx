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

export function ConversationListItem({
  conversation,
  isSelected,
  onClick,
}: ConversationListItemProps) {
  const lastMessage = conversation.messages?.[conversation.messages.length - 1];
  const time = conversation.lastCustomerMessageAt
    ? formatDistanceToNow(new Date(conversation.lastCustomerMessageAt), {
        locale: ptBR,
        addSuffix: false,
      })
    : '';

  return (
    <button
      onClick={onClick}
      className={`relative flex w-full gap-3 border-b border-gray-100 p-4 text-left transition-all hover:bg-white dark:border-gray-700/50 dark:hover:bg-gray-800 ${
        isSelected ? 'bg-white dark:bg-gray-800' : 'bg-transparent'
      }`}
    >
      <ContactAvatar
        name={conversation.customerName}
        status={isSelected ? 'online' : undefined}
        size="lg"
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between">
          <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">
            {conversation.customerName}
          </h4>
          <span
            className={`ml-2 whitespace-nowrap text-[10px] font-semibold ${
              conversation.messages?.some((m) => !isOutboundStatus(m.status)) // Simplified unread detection
                ? 'text-[#25D366]'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {time}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 truncate text-xs text-gray-500 dark:text-gray-400">
            {conversation.isBotEnabled && <Bot className="h-3 w-3 shrink-0 text-blue-500" />}
            {lastMessage?.content || 'Sem mensagens'}
          </p>
          {/* Badge placeholder (unreadCount would be here in real data) */}
        </div>
      </div>

      {isSelected && <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#25D366]" />}
    </button>
  );
}

// Helper (would usually be in a utils file)
function isOutboundStatus(status: any) {
  return status === 'Sent' || status === 'Delivered' || status === 'Read';
}
