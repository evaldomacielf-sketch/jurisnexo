'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2,
  MessageSquare,
  AlertCircle,
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
      const data = await clientsApi.getClientById(clientId);
      setClient(data);
    } catch (error) {
      toast.error('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await clientsApi.deleteClient(clientId);
      toast.success('Cliente removido com sucesso');
      router.push('/clientes');
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
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {client.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Cliente desde {formatDate(client.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/clientes/${clientId}/edit`)}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Trash2 className="h-4 w-4" />
            Remover
          </button>
        </div>
      </div>

      {/* Informações principais */}
      <Card className="overflow-hidden border-gray-200 bg-white p-0 dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <User className="h-5 w-5" />
            Informações de Contato
          </h3>
        </div>
        <div className="grid gap-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Telefone */}
            {client.phone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</p>
                  <p className="text-base text-gray-900 dark:text-white">{client.phone}</p>
                </div>
              </div>
            )}

            {/* Email */}
            {client.email && (
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">E-mail</p>
                  <p className="text-base text-gray-900 dark:text-white">{client.email}</p>
                </div>
              </div>
            )}

            {/* Origem */}
            {client.source && (
              <div className="flex items-start gap-3">
                <MessageSquare className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Origem</p>
                  <p className="text-base capitalize text-gray-900 dark:text-white">
                    {client.source}
                  </p>
                </div>
              </div>
            )}

            {/* Data de criação */}
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cliente desde
                </p>
                <p className="text-base text-gray-900 dark:text-white">
                  {formatDate(client.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Tags</p>
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {client.notes && (
            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Notas</p>
              <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                {client.notes}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs Custom Implementation */}
      <div className="w-full">
        <div className="mb-6 grid w-full grid-cols-3 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('interactions')}
            className={`rounded-md py-2 text-sm font-medium transition-all ${
              activeTab === 'interactions'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Interações
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`rounded-md py-2 text-sm font-medium transition-all ${
              activeTab === 'cases'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Casos
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`rounded-md py-2 text-sm font-medium transition-all ${
              activeTab === 'documents'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Documentos
          </button>
        </div>

        {activeTab === 'interactions' && <ClientInteractions clientId={clientId} />}

        {activeTab === 'cases' && (
          <Card className="border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              Lista de casos será implementada em breve.
            </p>
          </Card>
        )}

        {activeTab === 'documents' && <ClientDocuments clientId={clientId} />}
      </div>

      {/* Modal de Confirmação Customizado */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              Remover cliente
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Tem certeza que deseja remover {client.name}? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
