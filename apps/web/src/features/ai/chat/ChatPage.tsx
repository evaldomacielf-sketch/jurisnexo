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
  {
    icon: Calculator,
    label: 'Calcular prazo',
    prompt: 'Calcule o prazo de 15 dias úteis a partir de hoje',
  },
  {
    icon: Scale,
    label: 'Verificar prescrição',
    prompt: 'Verifique se uma ação indenizatória de 2020 está prescrita',
  },
  { icon: FileText, label: 'Gerar minuta', prompt: 'Gere uma minuta de petição inicial' },
  {
    icon: Search,
    label: 'Buscar jurisprudência',
    prompt: 'Busque jurisprudência sobre responsabilidade civil objetiva',
  },
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
        <aside className="flex w-80 flex-col border-r bg-white">
          {/* Header */}
          <div className="border-b p-4">
            <button
              onClick={startNewConversation}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-5 w-5" />
              Nova Conversa
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Conversas Recentes
            </p>
            {conversationsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : conversationsData?.items?.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-gray-500">Nenhuma conversa ainda</p>
            ) : (
              <ul className="space-y-1">
                {conversationsData?.items?.map((conv) => (
                  <li key={conv.id}>
                    <button
                      onClick={() => loadConversation(conv.id)}
                      className={`group flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-100 ${
                        conversationId === conv.id ? 'border border-blue-200 bg-blue-50' : ''
                      }`}
                    >
                      <MessageSquare className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{conv.title}</p>
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
                        className="p-1 text-gray-400 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                        aria-label="Excluir conversa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Powered by GPT-4</span>
            </div>
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col">
        {/* Toggle sidebar on mobile */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute left-4 top-4 z-10 rounded-lg bg-white p-2 shadow-md lg:hidden"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            className={`h-5 w-5 transition-transform ${showSidebar ? '' : 'rotate-180'}`}
          />
        </button>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex h-full flex-col items-center justify-center p-8">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">JurisNexo AI</h1>
              <p className="mb-8 max-w-md text-center text-gray-500">
                Seu assistente jurídico inteligente. Tire dúvidas, calcule prazos, busque
                jurisprudência e gere documentos.
              </p>

              {/* Suggested Prompts */}
              <div className="grid w-full max-w-xl grid-cols-2 gap-3">
                {SUGGESTED_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedPrompt(item.prompt)}
                    className="group flex items-center gap-3 rounded-xl border bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="rounded-lg bg-blue-50 p-2 transition-colors group-hover:bg-blue-100">
                      <item.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Messages
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                      message.role === 'user'
                        ? 'bg-blue-600'
                        : 'bg-gradient-to-br from-green-500 to-emerald-600'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`inline-block max-w-full rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'rounded-tr-md bg-blue-600 text-white'
                          : 'rounded-tl-md border bg-white shadow-sm'
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
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
          <div className="border-t border-red-200 bg-red-50 px-4 py-2">
            <p className="text-center text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="relative flex items-end gap-2 rounded-2xl bg-gray-100 p-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta jurídica..."
                rows={1}
                className="max-h-48 flex-1 resize-none border-0 bg-transparent px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-0"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="rounded-xl bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Enviar mensagem"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-400">
              JurisNexo AI pode cometer erros. Verifique informações importantes.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
