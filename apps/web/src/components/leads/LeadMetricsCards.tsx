'use client';

import React from 'react';
import type { LeadMetrics } from '@/lib/types/leads';
import {
    UsersIcon,
    CheckCircleIcon,
    ClockIcon,
    ChartBarIcon,
    ArrowUpIcon,
    ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface LeadMetricsCardsProps {
    metrics?: LeadMetrics;
    isLoading?: boolean;
}

interface MetricCard {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgLight: string;
    trend?: string;
    trendDirection?: 'up' | 'down';
    trendIsPositive?: boolean; // For response time, down is good
}

export default function LeadMetricsCards({ metrics, isLoading }: LeadMetricsCardsProps) {
    const cards: MetricCard[] = [
        {
            title: 'Total de Leads',
            value: metrics?.totalLeads ?? 0,
            icon: UsersIcon,
            color: 'text-blue-600',
            bgLight: 'bg-blue-100',
            trend: metrics?.leadsTrend,
            trendDirection: metrics?.leadsTrendDirection,
            trendIsPositive: true,
        },
        {
            title: 'Taxa de Conversão',
            value: `${((metrics?.conversionRateMonth ?? 0) * 100).toFixed(1)}%`,
            icon: ChartBarIcon,
            color: 'text-green-600',
            bgLight: 'bg-green-100',
            trend: metrics?.conversionTrend,
            trendDirection: metrics?.conversionTrendDirection,
            trendIsPositive: true,
        },
        {
            title: 'Tempo Médio de Resposta',
            value: `${metrics?.averageResponseTimeMinutes?.toFixed(0) ?? 0} min`,
            icon: ClockIcon,
            color: 'text-amber-600',
            bgLight: 'bg-amber-100',
            trend: metrics?.responseTimeTrend,
            trendDirection: metrics?.responseTimeTrendDirection,
            trendIsPositive: false, // Down is good for response time
        },
        {
            title: 'Leads Qualificados',
            value: metrics?.qualifiedLeads ?? metrics?.convertedCount ?? 0,
            icon: CheckCircleIcon,
            color: 'text-purple-600',
            bgLight: 'bg-purple-100',
            trend: metrics?.qualifiedTrend,
            trendDirection: metrics?.qualifiedTrendDirection,
            trendIsPositive: true,
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                            <div className="h-4 w-12 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    const getTrendColor = (card: MetricCard) => {
        if (!card.trend || !card.trendDirection) return '';

        const isPositiveTrend = card.trendIsPositive
            ? card.trendDirection === 'up'
            : card.trendDirection === 'down';

        return isPositiveTrend ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${card.bgLight}`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>

                        {card.trend && card.trendDirection && (
                            <span className={`flex items-center text-sm font-semibold ${getTrendColor(card)}`}>
                                {card.trendDirection === 'up' ? (
                                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                                ) : (
                                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                                )}
                                {card.trend}
                            </span>
                        )}
                    </div>

                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                        {card.title}
                    </h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {card.value}
                    </p>
                </div>
            ))}
        </div>
    );
}
