import React, { useState, useEffect, useRef } from 'react';
import { useWhatsAppMessages, useSendMessage, useMarkAsRead } from '@/hooks/useWhatsApp';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmojiPicker } from './EmojiPicker';
import { WhatsAppConversation } from '@/types/whatsapp';
import {
    Info as InformationCircleIcon,
    Smile as FaceSmileIcon,
    Paperclip as PaperClipIcon,
    Send as PaperAirplaneIcon
} from 'lucide-react'; // Mapping requested Heroicons to Lucide

interface ChatWindowProps {
    conversation: WhatsAppConversation;
    onToggleDetails: () => void;
    onSendMessage?: (text: string) => void; // Optional to support parent control if needed, but hook handles it
    isDetailsOpen?: boolean;
}

export function ChatWindow({ conversation, onToggleDetails }: ChatWindowProps) {
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
    }, [conversation.id, conversation.unreadCount]);

    const handleSend = async () => {
        if (!messageText.trim()) return;

        await sendMessage.mutateAsync({
            conversationId: conversation.id,
            content: messageText
        });

        setMessageText('');
        setShowEmojiPicker(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Placeholder for upload logic
        console.log("File upload requested", e.target.files);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Wrapped in div to ensure flex layout works if parent doesn't provide it */}

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar com status online */}
                    <div className="relative">
                        {/* Using img as requested, fallback to default if avatarUrl missing */}
                        <img
                            src={'/default-avatar.png'} // Placeholder as we don't have avatarUrl in type yet
                            alt={conversation.customerName}
                            className="w-10 h-10 rounded-full bg-gray-200"
                        />
                        {/* Status online is hardcoded or needs real-time hook. Using true for demo or implicit locally */}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    </div>

                    <div>
                        <h2 className="font-semibold text-gray-900">
                            {conversation.customerName}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {conversation.customerPhone}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onToggleDetails}
                    className="text-gray-600 hover:text-gray-900"
                    title="Ver detalhes do contato"
                    aria-label="Ver detalhes do contato"
                >
                    <InformationCircleIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
                    </div>
                ) : (
                    <>
                        {(messages || conversation.messages)?.map((message: any) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}

                        {/* Indicador "digitando..." - Hardcoded false or need hook */}
                        {/* {conversation.contact.isTyping && <TypingIndicator />} */}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input de Mensagem */}
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end gap-2 relative">
                    {/* Botão Emoji */}
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-gray-500 hover:text-gray-700 mb-2"
                        title="Abrir emojis"
                        aria-label="Abrir emojis"
                    >
                        <FaceSmileIcon className="w-6 h-6" />
                    </button>

                    {/* Botão Upload */}
                    <label className="text-gray-500 hover:text-gray-700 cursor-pointer mb-2" title="Anexar arquivo">
                        <PaperClipIcon className="w-6 h-6" />
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept="image/*,application/pdf,.doc,.docx"
                            aria-label="Anexar arquivo"
                        />
                    </label>

                    {/* Campo de Texto */}
                    <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Digite uma mensagem..."
                        rows={1}
                        className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[42px] max-h-32"
                    />

                    {/* Botão Enviar */}
                    <button
                        onClick={handleSend}
                        disabled={!messageText.trim()}
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
                        title="Enviar mensagem"
                        aria-label="Enviar mensagem"
                    >
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="absolute bottom-20 left-4 z-10">
                        <EmojiPicker
                            onSelect={(emoji: any) => {
                                setMessageText(messageText + (typeof emoji === 'string' ? emoji : emoji.native));
                                setShowEmojiPicker(false);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
