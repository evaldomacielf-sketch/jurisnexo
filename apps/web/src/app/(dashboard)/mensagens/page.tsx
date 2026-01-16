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
import {
  chatApi,
  Chat,
  ChatMessage,
  ChatType,
  MessageType,
  SendMessageDto,
} from '@/services/api/chat.service';
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Chat List */}
      <div className="flex w-80 flex-col border-r bg-white">
        {/* Header */}
        <div className="border-b p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
              Mensagens
            </h1>
            <button className="rounded-lg p-2 hover:bg-gray-100" aria-label="Nova conversa">
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setView('internal')}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${view === 'internal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Interno
            </button>
            <button
              onClick={() => setView('whatsapp')}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${view === 'whatsapp' ? 'bg-white text-[#25D366] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <MessageSquare className="mx-auto mb-2 h-10 w-10 text-gray-300" />
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
                    className={`flex w-full items-start gap-3 border-b p-4 text-left hover:bg-gray-50 ${
                      isSelected ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <ChatIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate font-medium text-gray-900">
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
                        <p className="truncate text-sm text-gray-500">{chat.lastMessage.content}</p>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
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
      <div className="flex flex-1 flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="flex h-16 items-center justify-between border-b bg-white px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                  {(() => {
                    const ChatIcon = CHAT_TYPE_ICONS[selectedChat.type];
                    return <ChatIcon className="h-5 w-5 text-indigo-600" />;
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
                <button className="rounded-lg p-2 hover:bg-gray-100" title="Chamada de vídeo">
                  <Video className="h-5 w-5 text-gray-600" />
                </button>
                <button className="rounded-lg p-2 hover:bg-gray-100" title="Chamada de voz">
                  <Phone className="h-5 w-5 text-gray-600" />
                </button>
                <button className="rounded-lg p-2 hover:bg-gray-100" title="Mais opções">
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="mx-auto mb-2 h-12 w-12 text-gray-300" />
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
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? 'rounded-br-none bg-indigo-600 text-white'
                            : 'rounded-bl-none border bg-white'
                        }`}
                      >
                        {!isOwnMessage && (
                          <p className="mb-1 text-xs font-medium text-indigo-600">
                            {msg.senderName}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                            isOwnMessage ? 'text-indigo-200' : 'text-gray-400'
                          }`}
                        >
                          <span>{formatMessageDate(msg.createdAt)}</span>
                          {isOwnMessage &&
                            (msg.readBy.length > 1 ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t bg-white p-4">
              <div className="flex items-end gap-3">
                <button
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                  title="Anexar arquivo"
                >
                  <Search className="h-5 w-5" />
                </button>
                <div className="relative flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    rows={1}
                    className="w-full resize-none rounded-xl border px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  className="rounded-xl bg-indigo-600 p-3 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Enviar mensagem"
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
                <MessageSquare className="h-10 w-10 text-indigo-600" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Suas mensagens</h2>
              <p className="max-w-sm text-gray-500">
                Selecione uma conversa ao lado ou inicie uma nova para começar a trocar mensagens.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
