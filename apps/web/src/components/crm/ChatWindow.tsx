import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';

interface Message {
    id: string;
    content: string;
    direction: 'INBOUND' | 'OUTBOUND';
    status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
    created_at: string;
}

interface ChatWindowProps {
    conversationId: string;
    messages: Message[];
    onSendMessage: (content: string) => Promise<void>;
    onScheduleTitle?: (data: any) => Promise<void>; // Optional for now
}

import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { Button } from '@/components/ui/button';

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, messages: initialMessages, onSendMessage }) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Real-time states
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { socket, joinConversation, leaveConversation, sendTyping } = useSocket();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Update local messages if initialMessages change (e.g. parent refetch)
    useEffect(() => {
        setMessages(initialMessages);
        scrollToBottom();
    }, [initialMessages]);

    // Socket Integration
    useEffect(() => {
        if (socket && conversationId) {
            joinConversation(conversationId);

            const handleNewMessage = (message: Message) => {
                // Avoid duplicates if we already added it optimistically or via refetch
                setMessages((prev) => {
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                scrollToBottom();
            };

            const handleTyping = (data: { isTyping: boolean }) => {
                setIsTyping(data.isTyping);
            };

            socket.on('message.new', handleNewMessage);
            socket.on('typing', handleTyping);

            return () => {
                leaveConversation(conversationId);
                socket.off('message.new', handleNewMessage);
                socket.off('typing', handleTyping);
            };
        }
    }, [socket, conversationId]);

    // Handle Typing Emitter
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);

        if (socket) {
            sendTyping(conversationId, true);

            // Debounce stop typing
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                sendTyping(conversationId, false);
            }, 2000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || sending) return;

        setSending(true);
        // Optimistically add message? For now wait for API response or socket
        // Actually typically we want optimistic UI. But for simplicity let's rely on API response 
        // which updates prop, or just wait for socket.
        // Let's implement simple optimistic update could be good but let's stick to props/socket for reliability first.
        try {
            await onSendMessage(inputText);
            setInputText('');
            sendTyping(conversationId, false);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.length === 0 ? (
                    <p className="text-center text-slate-400 mt-10">Nenhuma mensagem ainda.</p>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 text-sm ${msg.direction === 'OUTBOUND'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                                    }`}
                            >
                                <p>{msg.content}</p>
                                <div
                                    className={`text-[10px] mt-1 text-right ${msg.direction === 'OUTBOUND' ? 'text-blue-200' : 'text-slate-400'
                                        }`}
                                >
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {msg.direction === 'OUTBOUND' && (
                                        <span className="ml-1 opacity-75">
                                            {msg.status === 'QUEUED' && '🕒'}
                                            {msg.status === 'SENT' && '✓'}
                                            {msg.status === 'DELIVERED' && '✓✓'}
                                            {msg.status === 'FAILED' && '❌'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-lg p-3 rounded-bl-none shadow-sm">
                            <span className="text-xs text-slate-400 animate-pulse">Digitando...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Digite sua mensagem..."
                        value={inputText}
                        onChange={handleInputChange}
                        disabled={sending}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowScheduleModal(true)}
                        className="px-3"
                    >
                        📅
                    </Button>
                    <button
                        type="submit"
                        disabled={sending || !inputText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                        {sending ? 'Enviando...' : 'Enviar'}
                    </button>
                </form>
            </div>

            <ScheduleMeetingModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                conversationId={conversationId}
                onSchedule={async (data) => {
                    console.log('Scheduling:', data);
                    // In real app: call API
                    // await fetch('/api/crm/calendar/schedule', { method: 'POST', body: JSON.stringify(data) });
                    setShowScheduleModal(false);
                }}
            />
        </div>
    );
};

