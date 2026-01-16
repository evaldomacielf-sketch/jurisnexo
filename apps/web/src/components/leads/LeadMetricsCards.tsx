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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
              <div className="h-4 w-12 rounded bg-gray-200"></div>
            </div>
            <div className="mb-2 h-4 w-24 rounded bg-gray-200"></div>
            <div className="h-8 w-20 rounded bg-gray-200"></div>
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className={`rounded-lg p-3 ${card.bgLight}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>

            {card.trend && card.trendDirection && (
              <span className={`flex items-center text-sm font-semibold ${getTrendColor(card)}`}>
                {card.trendDirection === 'up' ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4" />
                )}
                {card.trend}
              </span>
            )}
          </div>

          <h3 className="mb-1 text-sm font-medium text-gray-500">{card.title}</h3>
          <p className="text-3xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
