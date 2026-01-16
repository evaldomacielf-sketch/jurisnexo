import React, { useState, useEffect } from 'react';
import { useWhatsAppConversations } from '@/hooks/useWhatsApp';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import ContactDetails from './ContactDetails';
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function WhatsAppDashboard() {
    const [selectedConversationId, setSelectedConversationId] =
        useState<string | null>(null);
    const [showContactDetails, setShowContactDetails] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: conversations, isLoading } = useWhatsAppConversations({
        filter,
        search: searchQuery
    });

    const selectedConversation = conversations?.find(
        c => c.id === selectedConversationId
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar Esquerda - Lista de Conversas */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-900 mb-3">
                        WhatsApp
                    </h1>

                    {/* Busca */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar conversas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 text-sm rounded-full ${filter === 'all'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1 text-sm rounded-full ${filter === 'unread'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            Não Lidas
                        </button>
                        <button
                            onClick={() => setFilter('archived')}
                            className={`px-3 py-1 text-sm rounded-full ${filter === 'archived'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            Arquivadas
                        </button>
                    </div>
                </div>

                {/* Lista de Conversas */}
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversationId}
                    onSelect={setSelectedConversationId}
                    isLoading={isLoading}
                />
            </div>

            {/* Área Central - Chat */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <ChatWindow
                        conversation={selectedConversation}
                        onToggleDetails={() => setShowContactDetails(!showContactDetails)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <ChatBubbleLeftRightIcon className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">Selecione uma conversa para começar</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Direita - Detalhes do Contato */}
            {showContactDetails && selectedConversation && (
                <div className="w-96 bg-white border-l border-gray-200">
                    <ContactDetails
                        contactId={selectedConversation.contactId} // Note: This assumes selectedConversation has contactId. If not, error.
                        onClose={() => setShowContactDetails(false)}
                    />
                </div>
            )}
        </div>
    );
}
