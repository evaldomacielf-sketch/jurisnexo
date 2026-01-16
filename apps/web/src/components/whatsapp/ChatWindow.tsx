import React, { useState, useEffect, useRef } from 'react';
import { useWhatsAppMessages, useSendMessage, useMarkAsRead } from '@/hooks/useWhatsApp';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import EmojiPicker from './EmojiPicker';
import { WhatsAppConversation } from '@/types/whatsapp';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'; // User generic icons

interface ChatWindowProps {
  conversation: WhatsAppConversation;
  onToggleDetails: () => void;
  // Props passed by Dashboard
  onSendMessage?: (text: string) => void;
  isDetailsOpen?: boolean;
}

export default function ChatWindow({ conversation, onToggleDetails }: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useWhatsAppMessages(conversation.id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Marcar como lida ao abrir
  useEffect(() => {
    if (conversation.unreadCount && conversation.unreadCount > 0) {
      markAsRead.mutate(conversation.id);
    }
  }, [conversation.id, conversation.unreadCount, markAsRead]);

  const handleSend = async () => {
    if (!messageText.trim()) return;

    // Using simple mutation which expects { conversationId, content }
    // The hook will resolve phone internally or we pass it if we updated hook (we didn't yet update hook to NOT resolve, so we rely on cache)
    await sendMessage.mutateAsync({
      conversationId: conversation.id,
      content: messageText,
    });

    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Stub for file upload
    console.log('File upload requested', e.target.files);
    alert('File upload not fully implemented in this demo.');
  };

  // Adaptation: conversation.contact is likely flattened in our current Type.
  // We use conversation directly.
  const contactName = conversation.customerName || conversation.customerPhone;
  const contactPhone = conversation.customerPhone;
  const contactAvatar = (conversation as any).avatarUrl || '/default-avatar.png'; // Type might not have avatarUrl
  const isOnline = false; // Stub
  const isTyping = false; // Stub

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar com status online */}
          <div className="relative">
            <img
              src={contactAvatar}
              alt={contactName}
              className="h-10 w-10 rounded-full bg-gray-200 object-cover"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">{contactName}</h2>
            <p className="text-sm text-gray-500">{contactPhone}</p>
          </div>
        </div>

        <button
          onClick={onToggleDetails}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <InformationCircleIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-[#efeae2] p-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500" />
          </div>
        ) : (
          <>
            {messages?.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Indicador "digitando..." */}
            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input de Mensagem */}
      <div className="relative border-t border-gray-200 bg-white p-4">
        <div className="flex items-end gap-2">
          {/* Botão Emoji */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FaceSmileIcon className="h-6 w-6" />
          </button>

          {/* Botão Upload */}
          <label className="cursor-pointer p-2 text-gray-500 hover:text-gray-700">
            <PaperClipIcon className="h-6 w-6" />
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,application/pdf,.doc,.docx"
            />
          </label>

          {/* Campo de Texto */}
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Botão Enviar */}
          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="mb-0.5 rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5 translate-x-0.5 -rotate-45 transform" />
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-10 rounded-lg bg-white shadow-lg">
            <EmojiPicker
              onSelect={(emoji: string) => {
                setMessageText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
