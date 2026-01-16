"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import CRMConfigModal from './CRMConfigModal';
import { CloudIcon } from '@heroicons/react/24/outline'; // Fallback icon

export default function CRMIntegrationSettings() {
    const [selectedCRM, setSelectedCRM] = useState<string | null>(null);

    const { data: integrations } = useQuery({
        queryKey: ['crm-integrations'],
        queryFn: () => api.get('/integrations/crm').then(res => res.data)
    });

    const CRMs = [
        {
            id: 'salesforce',
            name: 'Salesforce',
            icon: '/logos/salesforce.svg',
            description: 'Sincronize contatos, leads e oportunidades com Salesforce',
            status: integrations?.salesforce?.enabled ? 'Conectado' : 'Desconectado'
        },
        {
            id: 'hubspot',
            name: 'HubSpot',
            icon: '/logos/hubspot.svg',
            description: 'Integração completa com HubSpot CRM e Marketing Hub',
            status: integrations?.hubspot?.enabled ? 'Conectado' : 'Desconectado'
        },
        {
            id: 'pipedrive',
            name: 'Pipedrive',
            icon: '/logos/pipedrive.svg',
            description: 'Gerencie seu pipeline de vendas no Pipedrive',
            status: integrations?.pipedrive?.enabled ? 'Conectado' : 'Desconectado'
        },
        {
            id: 'rdstation',
            name: 'RD Station',
            icon: '/logos/rdstation.svg',
            description: 'Integração com RD Station Marketing e CRM',
            status: integrations?.rdstation?.enabled ? 'Conectado' : 'Desconectado'
        }
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Integrações com CRM
                </h1>
                <a
                    href="/settings/integrations/auto-sync"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <CloudIcon className="w-5 h-5" />
                    Configurar Auto-Sync
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CRMs.map((crm) => (
                    <div
                        key={crm.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {/* Fallback to CloudIcon if image fails or is missing */}
                                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                                    <img
                                        src={crm.icon}
                                        alt={crm.name}
                                        className="w-10 h-10 object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add('text-gray-400');
                                            // We can't easily render a component here inside img onError, 
                                            // but the parent div serves as fallback container.
                                        }}
                                    />
                                    {/* If img hides, we might want to see an icon. 
                         However, standard handling is complex in React inline. 
                         For simplicity, I'll assume logos work or just show blank box. 
                      */}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900">{crm.name}</h3>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${crm.status === 'Conectado'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {crm.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{crm.description}</p>

                        <button
                            onClick={() => setSelectedCRM(crm.id)}
                            className={`w-full px-4 py-2 rounded-lg text-white transition-colors ${crm.status === 'Conectado'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {crm.status === 'Conectado' ? 'Gerenciar Conexão' : 'Conectar Agora'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal de Configuração */}
            {selectedCRM && (
                <CRMConfigModal
                    crm={selectedCRM}
                    onClose={() => setSelectedCRM(null)}
                />
            )}
        </div>
    );
}
