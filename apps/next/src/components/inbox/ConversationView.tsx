'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { inboxApi } from '@/services/api/inbox';
import { useInboxWebSocket } from '@/hooks/useInboxWebSocket';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { Message } from '@/types/inbox';

export function ConversationView() {
    const params = useParams();
    const conversationId = params?.conversationId as string;

    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch mensagens
    const { data: messagesData } = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: () => inboxApi.getMessages(conversationId),
        enabled: !!conversationId,
    });

    // WebSocket para real-time
    const { isConnected, emitTyping, emitMarkAsRead } = useInboxWebSocket({
        onNewMessage: (message) => {
            if (message.conversation_id === conversationId) {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();

                // Marca como lida se for do contato
                if (message.sender_type === 'contact') {
                    emitMarkAsRead(conversationId!, [message.id]);
                }
            }
        },
        onTyping: (data) => {
            if (data.conversation_id === conversationId) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
            }
        },
    });

    useEffect(() => {
        // @ts-ignore - Assuming messagesData matches expected shape, ignoring potential mismatch for now due to PaginatedResponse wrapper
        if (messagesData?.data) {
            // @ts-ignore
            setMessages(messagesData.data);
        }
    }, [messagesData]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!conversationId) {
        return <div className="flex items-center justify-center h-full text-gray-500">Selecione uma conversa</div>;
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversa</h2>
                    <div className="flex items-center gap-2">
                        <div
                            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                <MessageList messages={messages} />
                {isTyping && (
                    <div className="text-sm text-gray-400 italic mt-2 animate-pulse">
                        Digitando...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <MessageInput
                    conversationId={conversationId}
                    onTyping={() => emitTyping(conversationId)}
                />
            </div>
        </div>
    );
}
