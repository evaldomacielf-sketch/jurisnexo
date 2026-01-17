'use client';

import { Header } from '@/components/dashboard/Header';
import { Users, Plus, Search, Filter, Loader2, MoreVertical, Phone, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clientsApi, ContactDto } from '@/services/api/clients.service';
import { useState } from 'react';

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: () => clientsApi.getAll({ search: searchTerm, limit: 100 }), // Fetching more for list view
  });

  const clients = data?.items || [];
  const hasClients = clients.length > 0;

  return (
    <>
      <Header showSearch={false} />

      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Clientes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie seus clientes e leads
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition">
            <Plus className="w-5 h-5" />
            Novo Cliente
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando clientes...</span>
          </div>
        ) : !hasClients && !searchTerm ? (
          /* Empty State (Only if no clients AND no search term) */
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Nenhum cliente cadastrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comece adicionando seu primeiro cliente ao sistema
            </p>
            <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition">
              Adicionar Primeiro Cliente
            </button>
          </div>
        ) : (
          /* Client List (Grid or Table) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client: ContactDto) => (
              <div key={client.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">{client.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${client.isLead ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {client.isLead ? 'Lead' : 'Cliente'}
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button className="text-sm font-medium text-primary hover:underline">
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
