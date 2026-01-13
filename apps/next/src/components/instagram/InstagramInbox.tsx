'use client';

import { useState, useEffect } from 'react';
import { Send, Image as ImageIcon, Paperclip, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================
// 💬 Instagram Inbox Component
// ============================================

interface InstagramMessage {
    id: string;
    from: string;
    to: string;
    message: string;
    created_time: string;
    attachments?: any[];
}

interface InstagramConversation {
    id: string;
    participant: {
        id: string;
        username: string;
        name: string;
        profile_pic: string;
    };
    messages: InstagramMessage[];
    updated_time: string;
    unread_count: number;
}

export function InstagramInbox() {
    const [conversations, setConversations] = useState<InstagramConversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<InstagramConversation | null>(null);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const response = await fetch('/api/instagram/conversations');
            const data = await response.json();
            setConversations(data);
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
        }
    };

    const sendMessage = async () => {
        if (!messageText.trim() || !selectedConversation) return;

        setLoading(true);
        try {
            await fetch('/api/instagram/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: selectedConversation.participant.id,
                    text: messageText,
                }),
            });

            setMessageText('');
            // Reload messages
            await loadConversations();
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-gray-900">
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
                            <defs>
                                <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#833AB4" />
                                    <stop offset="50%" stopColor="#FD1D1D" />
                                    <stop offset="100%" stopColor="#FCAF45" />
                                </linearGradient>
                            </defs>
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        Instagram DM
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 ${selectedConversation?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                        >
                            <img
                                src={conv.participant.profile_pic || '/default-avatar.png'}
                                alt={conv.participant.username}
                                className="w-12 h-12 rounded-full"
                            />
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                        {conv.participant.name || conv.participant.username}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(conv.updated_time), { locale: ptBR })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {conv.messages[0]?.message || 'Sem mensagens'}
                                </p>
                                {conv.unread_count > 0 && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                        {conv.unread_count}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages Area */}
            {selectedConversation ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <img
                                src={selectedConversation.participant.profile_pic}
                                alt={selectedConversation.participant.username}
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {selectedConversation.participant.name}
                                </p>
                                <p className="text-xs text-gray-500">@{selectedConversation.participant.username}</p>
                            </div>
                        </div>
                        <button
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                            aria-label="Mais opções"
                        >
                            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {selectedConversation.messages.map((msg) => {
                            const isOwn = msg.from === 'ME'; // Ajustar lógica
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-md px-4 py-2 rounded-2xl ${isOwn
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.message}</p>
                                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {formatDistanceToNow(new Date(msg.created_time), { locale: ptBR, addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" aria-label="Anexar arquivo">
                                <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" aria-label="Enviar imagem">
                                <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Digite uma mensagem..."
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!messageText.trim() || loading}
                                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full"
                                aria-label="Enviar mensagem"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    Selecione uma conversa para começar
                </div>
            )}
        </div>
    );
}
