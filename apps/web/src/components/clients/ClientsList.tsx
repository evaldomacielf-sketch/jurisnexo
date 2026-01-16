'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Eye, Edit, Trash2 } from 'lucide-react';
import { clientsApi } from '@/lib/api/clients';
import { CLIENT_STATUS_CONFIG, CLIENT_PRIORITY_CONFIG } from '@/lib/types/client';
import type { Client } from '@/lib/types/client';
import toast from 'react-hot-toast';
import Link from 'next/link';

export function ClientsList() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsApi.getClients();
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
      await clientsApi.deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
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
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <span className="text-3xl">👥</span>
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Nenhum cliente cadastrado
        </h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Comece adicionando seu primeiro cliente
        </p>
        <Link
          href="/clientes/new"
          className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
        >
          Adicionar Cliente
        </Link>
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
            className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              {/* Info */}
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{client.name}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.color} ${statusConfig.bgColor}`}
                  >
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
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </div>
                  )}
                  {client.addressCity && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {client.addressCity}, {client.addressState}
                    </div>
                  )}
                </div>

                {client.tags && client.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {client.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
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
                  onClick={() => router.push(`/clientes/${client.id}`)}
                  className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  title="Ver detalhes"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => router.push(`/clientes/${client.id}/edit`)}
                  className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  title="Editar"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Excluir"
                >
                  <Trash2 className="h-5 w-5" />
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
          className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-3 h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      ))}
    </div>
  );
}
