'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Send,
    Paperclip,
    MoreVertical,
    Phone,
    Video,
    MessageSquare,
    Check,
    CheckCheck,
    Smile,
    Search,
    Bot
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { whatsappApi } from '@/services/api/whatsapp.service';
import {
    WhatsAppConversation,
    WhatsAppDirection,
    WhatsAppMessageStatus
} from '@/types/whatsapp';

export function WhatsAppChatView() {
    const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [selectedId, conversations]);

    const loadConversations = async () => {
        try {
            const data = await whatsappApi.getConversations();
            setConversations(data);
            if (data.length > 0 && !selectedId) {
                // setSelectedId(data[0].id);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const selectedChat = conversations.find(c => c.id === selectedId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedChat) return;

        const text = messageText;
        setMessageText('');

        try {
            await whatsappApi.sendMessage({
                phone: selectedChat.customerPhone,
                content: text
            });
            // Re-load to show the sent message (Real implementation would use SignalR/Socket)
            loadConversations();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        return format(d, 'HH:mm');
    };

    return (
        <div className="flex h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Sidebar List */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800/40">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-[#25D366]" />
                        WhatsApp
                    </h2>
                    <div className="mt-3 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar conversas..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedId(conv.id)}
                            className={`w-full p-4 flex gap-3 hover:bg-white dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700/50 text-left ${selectedId === conv.id ? 'bg-white dark:bg-gray-800' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                                {conv.customerName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{conv.customerName}</h4>
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        {conv.lastCustomerMessageAt ? formatDistanceToNow(new Date(conv.lastCustomerMessageAt), { locale: ptBR }) : ''}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {conv.isBotEnabled && <Bot className="w-3 h-3 inline mr-1 text-blue-500" />}
                                    {conv.messages?.[conv.messages.length - 1]?.content || 'Nenhuma mensagem'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat View */}
            <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-gray-950 relative">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 bg-[#f0f2f5] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold">
                                    {selectedChat.customerName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white leading-none mb-1">{selectedChat.customerName}</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{selectedChat.customerPhone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500">
                                <Video className="w-5 h-5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" />
                                <Phone className="w-5 h-5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" />
                                <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600"></div>
                                <MoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" />
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 background-whatsapp">
                            {selectedChat.messages?.map((msg) => {
                                const isOutbound = msg.direction === WhatsAppDirection.Outbound;
                                return (
                                    <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-3 py-1.5 rounded-lg shadow-sm relative ${isOutbound
                                            ? 'bg-[#dcf8c6] dark:bg-[#056162] text-gray-900 dark:text-white rounded-tr-none'
                                            : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-white rounded-tl-none'
                                            }`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[9px] text-gray-500 dark:text-gray-400">
                                                    {formatTime(msg.sentAt)}
                                                </span>
                                                {isOutbound && (
                                                    msg.status === WhatsAppMessageStatus.Read
                                                        ? <CheckCheck className="w-3 h-3 text-blue-500" />
                                                        : <Check className="w-3 h-3 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-[#f0f2f5] dark:bg-gray-800 flex items-center gap-3">
                            <div className="flex items-center gap-3 text-gray-500">
                                <Smile className="w-6 h-6 cursor-pointer" />
                                <Paperclip className="w-6 h-6 cursor-pointer" />
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Digite uma mensagem"
                                    rows={1}
                                    className="w-full bg-white dark:bg-gray-700 border-none rounded-lg px-4 py-2 text-sm focus:ring-0 resize-none dark:text-white"
                                />
                            </div>
                            <button
                                aria-label="Enviar mensagem"
                                onClick={handleSendMessage}
                                className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg disabled:opacity-50"
                                disabled={!messageText.trim()}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">JurisNexo WhatsApp</h3>
                        <p className="max-w-md mx-auto text-gray-500 dark:text-gray-400">
                            Selecione uma conversa para começar a atender seus clientes em tempo real com integração total ao CRM.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
