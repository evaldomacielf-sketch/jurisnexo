'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Eye, Edit, Trash2 } from 'lucide-react';
import { clientsApi } from '@/lib/api/clients';
import { CLIENT_STATUS_CONFIG, CLIENT_PRIORITY_CONFIG } from '@/lib/types/client';
import type { Client } from '@/lib/types/client';
import toast from 'react-hot-toast';

export function ClientsList() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await clientsApi.getAll();
            setClients(data);
        } catch (error) {
            toast.error('Erro ao carregar clientes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

        try {
            await clientsApi.delete(id);
            setClients(clients.filter(c => c.id !== id));
            toast.success('Cliente excluído com sucesso');
        } catch (error) {
            toast.error('Erro ao excluir cliente');
        }
    };

    if (loading) {
        return <ClientsListSkeleton />;
    }

    if (clients.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👥</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Nenhum cliente cadastrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Comece adicionando seu primeiro cliente
                </p>
                <a
                    href="/dashboard/clients/new"
                    className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition"
                >
                    Adicionar Cliente
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {clients.map((client) => {
                const statusConfig = CLIENT_STATUS_CONFIG[client.status];
                const priorityConfig = CLIENT_PRIORITY_CONFIG[client.priority];

                return (
                    <div
                        key={client.id}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {client.name}
                                    </h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color} ${statusConfig.bgColor}`}>
                                        {statusConfig.label}
                                    </span>
                                    {client.priority !== 'normal' && (
                                        <span className={`text-xs font-medium ${priorityConfig.color}`}>
                                            {priorityConfig.icon} {priorityConfig.label}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    {client.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            {client.email}
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {client.phone}
                                        </div>
                                    )}
                                    {client.addressCity && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {client.addressCity}, {client.addressState}
                                        </div>
                                    )}
                                </div>

                                {client.tags && client.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {client.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                    title="Ver detalhes"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => router.push(`/dashboard/clients/${client.id}/edit`)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                    title="Editar"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(client.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ClientsListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
                >
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
            ))}
        </div>
    );
}
