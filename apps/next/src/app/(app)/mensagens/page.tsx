'use client';

import { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Send,
    Search,
    MoreVertical,
    Phone,
    Video,
    User,
    Users,
    Briefcase,
    Check,
    CheckCheck,
    Loader2,
    Plus,
} from 'lucide-react';
import { chatApi, Chat, ChatMessage, ChatType, MessageType, SendMessageDto } from '@/services/api/chat.service';
import WhatsAppDashboard from '@/components/whatsapp/WhatsAppDashboard';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CHAT_TYPE_ICONS: Record<ChatType, any> = {
    [ChatType.DIRECT]: User,
    [ChatType.GROUP]: Users,
    [ChatType.CASE]: Briefcase,
    [ChatType.CLIENT]: User,
};

export default function MensagensPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'internal' | 'whatsapp'>('internal');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadChats();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            loadMessages(selectedChat.id);
        }
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadChats = async () => {
        setLoading(true);
        try {
            const data = await chatApi.getAll();
            setChats(data);
        } catch (error) {
            console.error('Error loading chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (chatId: string) => {
        setLoadingMessages(true);
        try {
            const { messages: data } = await chatApi.getMessages(chatId);
            setMessages(data);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedChat) return;

        setSending(true);
        try {
            const dto: SendMessageDto = {
                chatId: selectedChat.id,
                type: MessageType.TEXT,
                content: messageText.trim(),
            };
            const newMessage = await chatApi.sendMessage(dto);
            setMessages((prev) => [...prev, newMessage]);
            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatMessageDate = (date: string) => {
        const d = new Date(date);
        if (isToday(d)) return format(d, 'HH:mm');
        if (isYesterday(d)) return `Ontem ${format(d, 'HH:mm')}`;
        return format(d, 'dd/MM HH:mm');
    };

    const filteredChats = chats.filter(
        (chat) =>
            chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.participants.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getChatName = (chat: Chat) => {
        if (chat.name) return chat.name;
        if (chat.type === ChatType.DIRECT && chat.participants.length > 0) {
            return chat.participants[0].name;
        }
        return 'Chat';
    };

    if (view === 'whatsapp') {
        return (
            <div className="h-screen bg-transparent p-4">
                <WhatsAppDashboard />
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-gray-100">
            {/* Sidebar - Chat List */}
            <div className="w-80 bg-white border-r flex flex-col">
                {/* Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-indigo-600" />
                            Mensagens
                        </h1>
                        <button className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Nova conversa">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar conversas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setView('internal')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'internal' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Interno
                        </button>
                        <button
                            onClick={() => setView('whatsapp')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'whatsapp' ? 'bg-white shadow-sm text-[#25D366]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            WhatsApp
                        </button>
                    </div>
                </div>

                {/* Chat List */}
                {view === 'internal' ? (
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                <p>Nenhuma conversa</p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => {
                                const ChatIcon = CHAT_TYPE_ICONS[chat.type];
                                const isSelected = selectedChat?.id === chat.id;

                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 border-b text-left ${isSelected ? 'bg-indigo-50' : ''
                                            }`}
                                    >
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <ChatIcon className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-900 truncate">
                                                    {getChatName(chat)}
                                                </span>
                                                {chat.lastMessage && (
                                                    <span className="text-xs text-gray-400">
                                                        {formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
                                                            addSuffix: false,
                                                            locale: ptBR,
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                            {chat.lastMessage && (
                                                <p className="text-sm text-gray-500 truncate">{chat.lastMessage.content}</p>
                                            )}
                                        </div>
                                        {chat.unreadCount > 0 && (
                                            <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {chat.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                ) : null}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 bg-white border-b flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                    {(() => {
                                        const ChatIcon = CHAT_TYPE_ICONS[selectedChat.type];
                                        return <ChatIcon className="w-5 h-5 text-indigo-600" />;
                                    })()}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">{getChatName(selectedChat)}</h2>
                                    <p className="text-xs text-gray-500">
                                        {selectedChat.participants.length} participantes
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg" title="Chamada de vídeo">
                                    <Video className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg" title="Chamada de voz">
                                    <Phone className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg" title="Mais opções">
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p>Sem mensagens ainda</p>
                                        <p className="text-sm">Comece a conversa!</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isOwnMessage = msg.senderId === 'current-user-id';
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwnMessage
                                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                                    : 'bg-white border rounded-bl-none'
                                                    }`}
                                            >
                                                {!isOwnMessage && (
                                                    <p className="text-xs font-medium text-indigo-600 mb-1">
                                                        {msg.senderName}
                                                    </p>
                                                )}
                                                <p className="text-sm">{msg.content}</p>
                                                <div
                                                    className={`flex items-center justify-end gap-1 mt-1 text-xs ${isOwnMessage ? 'text-indigo-200' : 'text-gray-400'
                                                        }`}
                                                >
                                                    <span>{formatMessageDate(msg.createdAt)}</span>
                                                    {isOwnMessage && (
                                                        msg.readBy.length > 1 ? (
                                                            <CheckCheck className="w-3 h-3" />
                                                        ) : (
                                                            <Check className="w-3 h-3" />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t p-4">
                            <div className="flex items-end gap-3">
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Anexar arquivo">
                                    <Search className="w-5 h-5" />
                                </button>
                                <div className="flex-1 relative">
                                    <textarea
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Digite sua mensagem..."
                                        rows={1}
                                        className="w-full resize-none border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black shadow-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!messageText.trim() || sending}
                                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Enviar mensagem"
                                >
                                    {sending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Suas mensagens</h2>
                            <p className="text-gray-500 max-w-sm">
                                Selecione uma conversa ao lado ou inicie uma nova para começar a trocar mensagens.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
