'use client';

import React from 'react';
import type { LeadFunnel } from '@/lib/types/leads';

interface LeadFunnelChartProps {
    funnel?: LeadFunnel;
    isLoading?: boolean;
}

interface FunnelStage {
    name: string;
    count: number;
    color: string;
    bgColor: string;
}

export default function LeadFunnelChart({ funnel, isLoading }: LeadFunnelChartProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const captured = funnel?.captured ?? (funnel?.new ?? 0) + (funnel?.qualifying ?? 0) + (funnel?.qualified ?? 0) + (funnel?.contacted ?? 0) + (funnel?.negotiating ?? 0) + (funnel?.converted ?? 0);

    const stages: FunnelStage[] = [
        { name: 'Leads Capturados', count: captured, color: 'text-blue-700', bgColor: 'bg-blue-500' },
        { name: 'Qualificados', count: funnel?.qualified ?? 0, color: 'text-green-700', bgColor: 'bg-green-500' },
        { name: 'Contatados', count: funnel?.contacted ?? 0, color: 'text-purple-700', bgColor: 'bg-purple-500' },
        { name: 'Em Negociação', count: funnel?.negotiating ?? 0, color: 'text-orange-700', bgColor: 'bg-orange-500' },
        { name: 'Convertidos', count: funnel?.converted ?? 0, color: 'text-emerald-700', bgColor: 'bg-emerald-500' },
    ];

    const maxCount = stages[0].count || 1;
    const conversionRate = maxCount > 0 ? ((funnel?.converted ?? 0) / maxCount) * 100 : 0;

    return (
        <div className="h-full p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                        Funil de Conversão
                    </h3>

                    <div className="space-y-6">
                        {stages.map((stage, index) => {
                            const percentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
                            const prevCount = index > 0 ? stages[index - 1].count : 0;
                            const dropoff = prevCount > 0 && index > 0
                                ? ((prevCount - stage.count) / prevCount) * 100
                                : 0;

                            return (
                                <div key={stage.name}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">{stage.name}</span>
                                        <span className="text-sm text-gray-600">
                                            {stage.count} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>

                                    {/* Funnel Bar */}
                                    <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                                        <div
                                            className={`h-full ${stage.bgColor} transition-all duration-500 flex items-center justify-center text-white font-semibold rounded-lg`}
                                            style={{ width: `${Math.max(percentage, 5)}%` }}
                                        >
                                            {percentage > 15 && `${percentage.toFixed(0)}%`}
                                        </div>
                                    </div>

                                    {/* Drop-off Rate */}
                                    {dropoff > 0 && (
                                        <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                            <span>↓</span>
                                            <span>{dropoff.toFixed(1)}% de perda</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Total Conversion Rate */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">Taxa de Conversão Total</span>
                            <span className="text-3xl font-bold text-green-600">
                                {conversionRate.toFixed(1)}%
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {funnel?.converted ?? 0} leads convertidos de {captured} capturados
                        </p>
                    </div>

                    {/* Lost Leads Indicator */}
                    {(funnel?.lost ?? 0) > 0 && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-center justify-between">
                                <span className="text-red-700 font-medium">Leads Perdidos</span>
                                <span className="text-red-700 font-bold">{funnel?.lost ?? 0}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
