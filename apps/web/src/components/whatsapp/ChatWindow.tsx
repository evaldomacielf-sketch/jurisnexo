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
    InformationCircleIcon
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
            content: messageText
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
        console.log("File upload requested", e.target.files);
        alert("File upload not fully implemented in this demo.");
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
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar com status online */}
                    <div className="relative">
                        <img
                            src={contactAvatar}
                            alt={contactName}
                            className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                        />
                        {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                    </div>

                    <div>
                        <h2 className="font-semibold text-gray-900">
                            {contactName}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {contactPhone}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onToggleDetails}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                >
                    <InformationCircleIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto bg-[#efeae2] p-6 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
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
            <div className="bg-white border-t border-gray-200 p-4 relative">
                <div className="flex items-end gap-2">
                    {/* Botão Emoji */}
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-gray-500 hover:text-gray-700 p-2"
                    >
                        <FaceSmileIcon className="w-6 h-6" />
                    </button>

                    {/* Botão Upload */}
                    <label className="text-gray-500 hover:text-gray-700 cursor-pointer p-2">
                        <PaperClipIcon className="w-6 h-6" />
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
                        className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 max-h-32"
                    />

                    {/* Botão Enviar */}
                    <button
                        onClick={handleSend}
                        disabled={!messageText.trim()}
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
                    >
                        <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45 translate-x-0.5" />
                    </button>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="absolute bottom-20 left-4 z-10 shadow-lg rounded-lg bg-white">
                        <EmojiPicker
                            onSelect={(emoji: string) => {
                                setMessageText(prev => prev + emoji);
                                setShowEmojiPicker(false);
                            }}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
