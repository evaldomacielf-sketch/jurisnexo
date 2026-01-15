'use client';

import React from 'react';
import { useContactDetails, useWhatsAppTemplates, useSendTemplate } from '@/hooks/useWhatsApp';
import { X as XMarkIcon } from 'lucide-react'; // Mapping XMarkIcon to Lucide X
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WhatsAppContactDetails } from '@/types/whatsapp';

interface ContactDetailsProps {
    contactId: string;
    onClose: () => void;
}

export function ContactDetails({ contactId, onClose }: ContactDetailsProps) {
    const { data: contact, isLoading } = useContactDetails(contactId);
    const { data: templates } = useWhatsAppTemplates();
    const sendTemplate = useSendTemplate();

    if (isLoading) return <div className="p-4 text-center text-gray-500">Carregando...</div>;
    if (!contact) return null;

    const handleSendTemplate = async (templateId: string) => {
        await sendTemplate.mutateAsync({
            conversationId: contact.conversationId,
            templateId,
            variables: {
                nome: contact.name,
                processo: contact.processos?.[0]?.numero || ''
            }
        });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Detalhes do Contato</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700" title="Fechar" aria-label="Fechar">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* Informações do Contato */}
                <div className="text-center">
                    <img
                        src={contact.avatarUrl || '/default-avatar.png'}
                        alt={contact.name}
                        className="w-24 h-24 rounded-full mx-auto mb-3 bg-gray-200 object-cover"
                    />
                    <h2 className="text-xl font-semibold text-gray-900">{contact.name}</h2>
                    <p className="text-gray-600">{contact.phoneNumber}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                        {contact.tags?.map((tag) => (
                            <span
                                key={tag.id}
                                className="px-2 py-1 text-xs rounded-full"
                                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Informações Adicionais */}
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900 break-words">{contact.email || '-'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">CPF/CNPJ</label>
                        <p className="text-gray-900">{contact.cpfCnpj || '-'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Endereço</label>
                        <p className="text-gray-900">{contact.endereco || '-'}</p>
                    </div>
                </div>

                {/* Processos Vinculados */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Processos Vinculados</h4>
                    {contact.processos && contact.processos.length > 0 ? (
                        <div className="space-y-2">
                            {contact.processos.map((processo) => (
                                <div
                                    key={processo.id}
                                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <p className="font-medium text-gray-900 truncate" title={processo.numero}>{processo.numero}</p>
                                            <p className="text-sm text-gray-600 truncate" title={processo.titulo}>{processo.titulo}</p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full shrink-0 ${processo.status === 'ativo'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {processo.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Nenhum processo vinculado</p>
                    )}
                </div>

                {/* Templates Rápidos */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Templates Rápidos</h4>
                    {templates && templates.length > 0 ? (
                        <div className="space-y-2">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm mb-1 truncate">
                                                {template.name}
                                            </p>
                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                {template.content}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleSendTemplate(template.id)}
                                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 shrink-0"
                                        >
                                            Enviar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Nenhum template disponível</p>
                    )}
                </div>

                {/* Histórico de Interações */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Histórico</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>✅ Primeira mensagem: {formatDate(contact.firstMessageAt)}</p>
                        <p>💬 Total de mensagens: {contact.totalMessages}</p>
                        <p>📅 Última interação: {formatDate(contact.lastMessageAt)}</p>
                        <p>⭐ Satisfação: {contact.satisfactionRating || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
