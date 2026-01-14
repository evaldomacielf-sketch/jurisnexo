'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Edit,
    Trash2,
    MessageSquare,
    AlertCircle
} from 'lucide-react';
import { clientsApi } from '@/lib/api/clients';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ClientInteractions } from './ClientInteractions';
import { ClientDocuments } from './ClientDocuments';
import type { Client } from '@/lib/types/client';
import { Card } from '@/components/ui/card';

export function ClientDetails({ clientId }: { clientId: string }) {
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('interactions');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        loadClient();
    }, [clientId]);

    const loadClient = async () => {
        try {
            const data = await clientsApi.getById(clientId);
            setClient(data);
        } catch (error) {
            toast.error('Erro ao carregar dados do cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await clientsApi.delete(clientId);
            toast.success('Cliente removido com sucesso');
            router.push('/dashboard/clients');
        } catch (error) {
            toast.error('Erro ao remover cliente');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (e) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!client) {
        return (
            <Card className="border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <p>Erro ao carregar dados do cliente</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header com ações */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{client.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Cliente desde {formatDate(client.createdAt)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/dashboard/clients/${clientId}/edit`)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <Edit className="h-4 w-4" />
                        Editar
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <Trash2 className="h-4 w-4" />
                        Remover
                    </button>
                </div>
            </div>

            {/* Informações principais */}
            <Card className="p-0 overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                        <User className="h-5 w-5" />
                        Informações de Contato
                    </h3>
                </div>
                <div className="p-6 grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Telefone */}
                        {client.phone && (
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Telefone
                                    </p>
                                    <p className="text-base text-gray-900 dark:text-white">{client.phone}</p>
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        {client.email && (
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        E-mail
                                    </p>
                                    <p className="text-base text-gray-900 dark:text-white">{client.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Origem */}
                        {client.source && (
                            <div className="flex items-start gap-3">
                                <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Origem
                                    </p>
                                    <p className="text-base capitalize text-gray-900 dark:text-white">{client.source}</p>
                                </div>
                            </div>
                        )}

                        {/* Data de criação */}
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Cliente desde
                                </p>
                                <p className="text-base text-gray-900 dark:text-white">{formatDate(client.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {client.tags && client.tags.length > 0 && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Tags
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {client.tags.map((tag) => (
                                    <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notas */}
                    {client.notes && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Notas
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                {client.notes}
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Tabs Custom Implementation */}
            <div className="w-full">
                <div className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
                    <button
                        onClick={() => setActiveTab('interactions')}
                        className={`py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'interactions'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Interações
                    </button>
                    <button
                        onClick={() => setActiveTab('cases')}
                        className={`py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'cases'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Casos
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'documents'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Documentos
                    </button>
                </div>

                {activeTab === 'interactions' && (
                    <ClientInteractions clientId={clientId} />
                )}

                {activeTab === 'cases' && (
                    <Card className="p-6 text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <p className="text-gray-500 dark:text-gray-400">
                            Lista de casos será implementada em breve.
                        </p>
                    </Card>
                )}

                {activeTab === 'documents' && (
                    <ClientDocuments clientId={clientId} />
                )}
            </div>

            {/* Modal de Confirmação Customizado */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Remover cliente</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Tem certeza que deseja remover {client.name}? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
