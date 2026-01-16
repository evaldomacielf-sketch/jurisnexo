"use client";

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PropType {
    crm: string;
    onClose: () => void;
}

export default function CRMConfigModal({ crm, onClose }: PropType) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const fields: any = {
        salesforce: [
            { name: 'ClientId', label: 'Client ID', type: 'text' },
            { name: 'ClientSecret', label: 'Client Secret', type: 'password' },
            { name: 'Username', label: 'Username', type: 'text' },
            { name: 'Password', label: 'Password', type: 'password' },
            { name: 'SecurityToken', label: 'Security Token', type: 'password' }
        ],
        hubspot: [
            { name: 'ApiKey', label: 'API Key', type: 'password' }
        ],
        pipedrive: [
            { name: 'ApiToken', label: 'API Token', type: 'password' },
            { name: 'CompanyDomain', label: 'Company Domain', type: 'text' }
        ],
        rdstation: [
            { name: 'ClientId', label: 'Client ID', type: 'text' },
            { name: 'ClientSecret', label: 'Client Secret', type: 'password' },
            { name: 'Code', label: 'Code (OAuth)', type: 'text' }
        ]
    };

    const currentFields = fields[crm] || [];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/integrations/crm/${crm}`, formData);
            toast.success(`${crm.toUpperCase()} configurado com sucesso!`);
            onClose();
        } catch (error) {
            toast.error("Erro ao salvar configuração.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold mb-4 capitalize">Configurar {crm}</h2>

                <form onSubmit={handleSave} className="space-y-4">
                    {currentFields.map((field: any) => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={`Digite seu ${field.label}`}
                            />
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar Conexão'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
