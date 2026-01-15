'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Send,
    Plus,
    MessageSquare,
    Trash2,
    Bot,
    User,
    Loader2,
    Search,
    ChevronLeft,
    Sparkles,
    FileText,
    Calendar,
    Scale,
    Calculator,
} from 'lucide-react';
import { useChatState, useConversations, useDeleteConversation } from '../hooks/useAi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Suggested prompts for quick actions
const SUGGESTED_PROMPTS = [
    { icon: Calculator, label: 'Calcular prazo', prompt: 'Calcule o prazo de 15 dias úteis a partir de hoje' },
    { icon: Scale, label: 'Verificar prescrição', prompt: 'Verifique se uma ação indenizatória de 2020 está prescrita' },
    { icon: FileText, label: 'Gerar minuta', prompt: 'Gere uma minuta de petição inicial' },
    { icon: Search, label: 'Buscar jurisprudência', prompt: 'Busque jurisprudência sobre responsabilidade civil objetiva' },
];

export default function ChatPage() {
    const [inputValue, setInputValue] = useState('');
    const [showSidebar, setShowSidebar] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const {
        conversationId,
        messages,
        isLoading,
        error,
        sendMessage,
        loadConversation,
        startNewConversation,
    } = useChatState();

    const { data: conversationsData, isLoading: conversationsLoading } = useConversations();
    const deleteConversation = useDeleteConversation();

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
        }
    }, [inputValue]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const message = inputValue;
        setInputValue('');
        await sendMessage(message);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSuggestedPrompt = (prompt: string) => {
        setInputValue(prompt);
        inputRef.current?.focus();
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            {showSidebar && (
                <aside className="w-80 bg-white border-r flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b">
                        <button
                            onClick={startNewConversation}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Nova Conversa
                        </button>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto p-2">
                        <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Conversas Recentes
                        </p>
                        {conversationsLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : conversationsData?.items?.length === 0 ? (
                            <p className="px-3 py-4 text-sm text-gray-500 text-center">
                                Nenhuma conversa ainda
                            </p>
                        ) : (
                            <ul className="space-y-1">
                                {conversationsData?.items?.map((conv) => (
                                    <li key={conv.id}>
                                        <button
                                            onClick={() => loadConversation(conv.id)}
                                            className={`w-full flex items-start gap-3 p-3 rounded-lg text-left hover:bg-gray-100 transition-colors group ${conversationId === conv.id ? 'bg-blue-50 border border-blue-200' : ''
                                                }`}
                                        >
                                            <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {conv.title}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(conv.updatedAt), {
                                                        addSuffix: true,
                                                        locale: ptBR,
                                                    })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteConversation.mutate(conv.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                                aria-label="Excluir conversa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-gray-50">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            <span>Powered by GPT-4</span>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col">
                {/* Toggle sidebar on mobile */}
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="lg:hidden absolute top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-md"
                    aria-label="Toggle sidebar"
                >
                    <ChevronLeft className={`w-5 h-5 transition-transform ${showSidebar ? '' : 'rotate-180'}`} />
                </button>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto">
                    {messages.length === 0 ? (
                        // Welcome Screen
                        <div className="h-full flex flex-col items-center justify-center p-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <Bot className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                JurisNexo AI
                            </h1>
                            <p className="text-gray-500 text-center max-w-md mb-8">
                                Seu assistente jurídico inteligente. Tire dúvidas, calcule prazos,
                                busque jurisprudência e gere documentos.
                            </p>

                            {/* Suggested Prompts */}
                            <div className="grid grid-cols-2 gap-3 max-w-xl w-full">
                                {SUGGESTED_PROMPTS.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestedPrompt(item.prompt)}
                                        className="flex items-center gap-3 p-4 bg-white rounded-xl border hover:border-blue-300 hover:shadow-md transition-all text-left group"
                                    >
                                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <item.icon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Messages
                        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                                ? 'bg-blue-600'
                                                : 'bg-gradient-to-br from-green-500 to-emerald-600'
                                            }`}
                                    >
                                        {message.role === 'user' ? (
                                            <User className="w-5 h-5 text-white" />
                                        ) : (
                                            <Bot className="w-5 h-5 text-white" />
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    <div
                                        className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'
                                            }`}
                                    >
                                        <div
                                            className={`inline-block max-w-full p-4 rounded-2xl ${message.role === 'user'
                                                    ? 'bg-blue-600 text-white rounded-tr-md'
                                                    : 'bg-white border rounded-tl-md shadow-sm'
                                                }`}
                                        >
                                            {message.isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span className="text-gray-500">Pensando...</span>
                                                </div>
                                            ) : message.role === 'assistant' ? (
                                                <div className="prose prose-sm max-w-none text-gray-700">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t bg-white p-4">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                        <div className="relative flex items-end gap-2 bg-gray-100 rounded-2xl p-2">
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Digite sua pergunta jurídica..."
                                rows={1}
                                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-2 px-3 text-gray-900 placeholder-gray-500 max-h-48"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Enviar mensagem"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-2">
                            JurisNexo AI pode cometer erros. Verifique informações importantes.
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}
