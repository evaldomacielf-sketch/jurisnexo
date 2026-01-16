"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from 'date-fns';
import {
    CloudArrowUpIcon,
    QueueListIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline'; // Adjust imports if needed

// Types
interface SyncHistoryDto {
    id: string;
    crmName: string;
    entityType: string;
    entityId: string;
    status: string;
    timestamp: string;
    action?: string; // Derived or extra field
    leadName?: string; // Derived or extra field
}

interface SyncQueueStatusDto {
    pendingItems: number;
    retryItems: number;
    todayCount?: number;
    successCount?: number;
    failedCount?: number;
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between border-l-4 border-l-${color}-500`}>
        <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 bg-${color}-50 rounded-full`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
    </div>
);

export default function CRMSyncDashboard() {
    const { data: syncHistory } = useQuery<SyncHistoryDto[]>({
        queryKey: ['crm-sync-history'],
        queryFn: () => api.get('/integrations/crm/sync-history').then(res => res.data),
        refetchInterval: 10000
    });

    const { data: queueStatus } = useQuery<SyncQueueStatusDto>({
        queryKey: ['crm-sync-queue'],
        queryFn: () => api.get('/integrations/crm/sync-queue').then(res => res.data),
        refetchInterval: 5000
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Monitoramento de Sincronização CRM
            </h1>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <StatCard
                    title="Sincronizações Hoje"
                    value={queueStatus?.todayCount || 0}
                    icon={CloudArrowUpIcon}
                    color="blue"
                />
                <StatCard
                    title="Na Fila"
                    value={queueStatus?.pendingItems || 0} // Mapped pendingItems
                    icon={QueueListIcon}
                    color="yellow"
                />
                <StatCard
                    title="Sucesso (hoje)"
                    value={queueStatus?.successCount || 0}
                    icon={CheckCircleIcon}
                    color="green"
                />
                <StatCard
                    title="Falhas"
                    value={queueStatus?.failedCount || 0}
                    icon={XCircleIcon}
                    color="red"
                />
            </div>

            {/* Histórico de Sincronizações */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Histórico Recente
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                                    Data/Hora
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                                    Lead
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                                    CRM
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                                    Ação
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {syncHistory?.map((sync) => (
                                <tr key={sync.id} className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                        {format(new Date(sync.timestamp), 'dd/MM/yyyy HH:mm')}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                        {sync.entityId} {/* Using EntityId as Lead Name unavailable in simpler DTO */}
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                        <img
                                            src={`/logos/${sync.crmName.toLowerCase()}.svg`}
                                            alt={sync.crmName}
                                            className="w-6 h-6 object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                        <span className="ml-2 text-xs text-gray-500">{sync.crmName}</span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {sync.entityType} Update {/* Simplified */}
                                    </td>
                                    <td className="py-3 px-4">
                                        {sync.status === 'Success' ? (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircleIcon className="w-5 h-5" />
                                                Sucesso
                                            </span>
                                        ) : sync.status === 'Failed' ? (
                                            <span className="flex items-center gap-1 text-red-600">
                                                <XCircleIcon className="w-5 h-5" />
                                                Falha
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-yellow-600">
                                                <ClockIcon className="w-5 h-5" />
                                                Pendente
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
