'use client';

import React from 'react';
import type { LeadDto } from '@/lib/types/leads';
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    CalendarIcon,
    EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

interface LeadListViewProps {
    leads?: LeadDto[];
    isLoading?: boolean;
    onSelectLead?: (lead: LeadDto) => void;
}

const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
        New: 'bg-blue-100 text-blue-700',
        Qualifying: 'bg-indigo-100 text-indigo-700',
        Qualified: 'bg-purple-100 text-purple-700',
        Assigned: 'bg-cyan-100 text-cyan-700',
        Contacted: 'bg-amber-100 text-amber-700',
        Negotiating: 'bg-orange-100 text-orange-700',
        Won: 'bg-green-100 text-green-700',
        Lost: 'bg-red-100 text-red-700',
        Spam: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
};

const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
        case 'high': return 'text-green-600';
        case 'medium': return 'text-yellow-600';
        case 'low': return 'text-red-600';
        default: return 'text-gray-600';
    }
};

export default function LeadListView({ leads = [], isLoading, onSelectLead }: LeadListViewProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto">
            <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lead
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo de Caso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Advogado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fonte
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                        <tr
                            key={lead.id}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => onSelectLead?.(lead)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {lead.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                            <PhoneIcon className="w-3 h-3" />
                                            {lead.phoneNumber}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(lead.status)}`}>
                                    {lead.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {lead.caseType || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <span className={`font-semibold ${getQualityColor(lead.quality)}`}>
                                        {lead.score}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        ({lead.quality})
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {lead.assignedToUserName || (
                                    <span className="text-gray-400 italic">Não atribuído</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                                    {lead.source}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Mais opções"
                                    title="Mais opções"
                                >
                                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                                </button>
                            </td>
                        </tr>
                    ))}

                    {leads.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                Nenhum lead encontrado
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
