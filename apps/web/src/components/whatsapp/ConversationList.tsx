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
  isLoading,
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
          className={`cursor-pointer border-b border-gray-100 p-4 hover:bg-gray-50 ${
            selectedId === conv.id ? 'bg-green-50' : ''
          }`}
        >
          <div className="mb-1 flex justify-between">
            <h3 className="font-semibold text-gray-900">
              {conv.customerName || conv.customerPhone}
            </h3>
            {conv.lastMessageAt && (
              <span className="text-xs text-gray-500">
                {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
          <div className="flex justify-between">
            <p className="max-w-[200px] truncate text-sm text-gray-600">
              {conv.lastMessage || 'Nova conversa'}
            </p>
            {conv.unreadCount > 0 && (
              <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
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
