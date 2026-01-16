import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ContactDetailsProps {
  contactId?: string; // Optional because conversation might not have it strictly typed yet
  onClose: () => void;
}

export default function ContactDetails({ contactId, onClose }: ContactDetailsProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Dados do Contato</h2>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
          <XMarkIcon className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-semibold text-gray-500">
            {/* Avatar Placeholder */}?
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Nome</label>
            <p className="text-gray-900">Carregando...</p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Telefone</label>
            <p className="text-gray-900">Carregando...</p>
          </div>
          {/* Add more details here */}
        </div>

        <div className="mt-8">
          <h3 className="mb-2 font-semibold">Ações</h3>
          <button className="mb-2 w-full rounded-lg bg-blue-50 py-2 text-blue-700 hover:bg-blue-100">
            Ver no CRM
          </button>
          <button className="w-full rounded-lg bg-gray-100 py-2 text-gray-700 hover:bg-gray-200">
            Criar Tarefa
          </button>
        </div>
      </div>
    </div>
  );
}
