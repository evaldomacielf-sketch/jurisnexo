import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ContactDetailsProps {
    contactId?: string; // Optional because conversation might not have it strictly typed yet
    onClose: () => void;
}

export default function ContactDetails({ contactId, onClose }: ContactDetailsProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-lg text-gray-900">Dados do Contato</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
            </div>

            <div className="p-6">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl text-gray-500 font-semibold">
                        {/* Avatar Placeholder */}
                        ?
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Nome</label>
                        <p className="text-gray-900">Carregando...</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Telefone</label>
                        <p className="text-gray-900">Carregando...</p>
                    </div>
                    {/* Add more details here */}
                </div>

                <div className="mt-8">
                    <h3 className="font-semibold mb-2">Ações</h3>
                    <button className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg mb-2 hover:bg-blue-100">
                        Ver no CRM
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                        Criar Tarefa
                    </button>
                </div>
            </div>
        </div>
    );
}
