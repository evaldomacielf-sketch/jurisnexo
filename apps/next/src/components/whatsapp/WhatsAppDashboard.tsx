'use client';

import React, { useState } from 'react';
import { useWhatsAppConversations } from '@/hooks/useWhatsApp';
import ConversationList from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { ContactDetails } from './ContactDetails';
import { whatsappApi } from '@/services/api/whatsapp.service';
import { WhatsAppTemplate } from '@/types/whatsapp';
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'; // Using Heroicons as per likely design system or swapping to Lucide if preferred. User didn't verify icon lib.
// Note: User code used `MagnifyingGlassIcon` which is typical of Heroicons v2. 
// My previous files used Lucide. I will stick to Lucide where possible but map them if needed.
// However, `MagnifyingGlassIcon` is distinctly Heroicons.
// Let me double check if I have Heroicons installed. `package.json` didn't show it explicitly but `@types/react` etc might have it or `lucide-react` is used elsewhere.
// I will import typical names from `lucide-react` to be safe OR just use `Search` as `MagnifyingGlass`.
import { Search, MessageSquare } from 'lucide-react';

export default function WhatsAppDashboard() {
    const [selectedConversationId, setSelectedConversationId] =
        useState<string | null>(null);
    const [showContactDetails, setShowContactDetails] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: conversations, isLoading, refetch } = useWhatsAppConversations({
        filter,
        search: searchQuery
    });

    const selectedConversation = conversations?.find(
        c => c.id === selectedConversationId
    );

    const handleSendMessage = async (text: string) => {
        if (!selectedConversation) return;
        try {
            await whatsappApi.sendMessage({
                phone: selectedConversation.customerPhone,
                content: text
            });
            refetch(); // Refresh list to show new message or status
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleSendTemplate = async (template: WhatsAppTemplate) => {
        if (!selectedConversation) return;
        try {
            await whatsappApi.sendMessage({
                phone: selectedConversation.customerPhone,
                content: template.content
            });
            refetch();
            setShowContactDetails(false);
        } catch (error) {
            console.error('Error sending template:', error);
        }
    };

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
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === 'all'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === 'unread'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Não Lidas
                        </button>
                        <button
                            onClick={() => setFilter('archived')}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === 'archived'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                        onSendMessage={handleSendMessage}
                        isDetailsOpen={showContactDetails}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <MessageSquare className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">Selecione uma conversa para começar</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Direita - Detalhes do Contato */}
            {showContactDetails && selectedConversation && (
                <div className="w-96 bg-white border-l border-gray-200">
                    <ContactDetails
                        conversation={selectedConversation}
                        onClose={() => setShowContactDetails(false)}
                        onSendTemplate={handleSendTemplate}
                    />
                </div>
            )}
        </div>
    );
}
