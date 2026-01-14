'use client';

import { X, MessageSquare, Mic } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { WhatsAppConversation, PendingInvitation } from '@/lib/types/kanban';

// ============================================
// 💬 WhatsApp Sidebar Component
// ============================================

interface WhatsAppSidebarProps {
    conversations?: WhatsAppConversation[];
    invitations?: PendingInvitation[];
}

const MOCK_INVITATIONS: PendingInvitation[] = [
    {
        id: '1',
        name: 'Fernanda Almeida',
        initials: 'FA',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
        id: '2',
        name: 'Lucas Carvalho',
        initials: 'LC',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
];

const MOCK_CONVERSATIONS: WhatsAppConversation[] = [
    {
        id: '1',
        clientName: 'João Pereira',
        clientInitials: 'JP',
        lastMessage: 'Você já revisou o contrato?',
        messageType: 'text',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        unreadCount: 2,
        caseTag: 'DANOS_MORAIS',
        isActive: true,
    },
    {
        id: '2',
        clientName: 'Sara Santos',
        clientInitials: 'SS',
        lastMessage: 'Mensagem de voz (0:45)',
        messageType: 'voice',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        unreadCount: 0,
    },
];

export function WhatsAppSidebar({ conversations = MOCK_CONVERSATIONS, invitations = MOCK_INVITATIONS }: WhatsAppSidebarProps) {
    return (
        <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                    </svg>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">WhatsApp</h4>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">
                        Ativo
                    </span>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Pending Invitations */}
                {invitations.length > 0 && (
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h5 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
                            Convites Pendentes
                        </h5>
                        <div className="space-y-3">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                                            {invitation.initials}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold truncate text-gray-900 dark:text-white">
                                                {invitation.name}
                                            </p>
                                            <p className="text-[10px] text-gray-600 dark:text-gray-400">
                                                Enviado {formatDistanceToNow(invitation.sentAt, { locale: ptBR, addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <button aria-label="Dispensar convite" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors p-1">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conversations */}
                <div>
                    {conversations.map((conv, index) => (
                        <div
                            key={conv.id}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${conv.isActive ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-l-blue-500' : ''
                                }`}
                        >
                            <div className="flex gap-3">
                                {/* Avatar */}
                                <div className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                    {conv.clientInitials}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="text-sm font-bold truncate text-gray-900 dark:text-white">
                                            {conv.clientName}
                                        </h5>
                                        <span className={`text-[10px] font-bold ${conv.unreadCount > 0 ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {formatDistanceToNow(conv.timestamp, { locale: ptBR })}
                                        </span>
                                    </div>

                                    {/* Message Preview */}
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                                        {conv.messageType === 'voice' && <Mic className="w-3 h-3" />}
                                        {conv.lastMessage}
                                    </p>

                                    {/* Footer */}
                                    {(conv.caseTag || conv.unreadCount > 0) && (
                                        <div className="mt-2 flex items-center justify-between">
                                            {conv.caseTag && (
                                                <span className="text-[10px] text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                                                    {conv.caseTag.replace('_', ' ')}
                                                </span>
                                            )}
                                            {conv.unreadCount > 0 && (
                                                <span className="min-w-[20px] h-5 bg-blue-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold ml-auto px-1">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Conversation Button */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs font-bold hover:bg-white dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Nova Conversa
                </button>
            </div>
        </aside>
    );
}
