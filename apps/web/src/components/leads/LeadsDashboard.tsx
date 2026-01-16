'use client';

import React, { useState } from 'react';
import { useLeads, useLeadFunnel, useLeadMetrics } from '@/hooks/useLeads';
import LeadKanbanBoard from './LeadKanbanBoard';
import LeadFunnelChart from './LeadFunnelChart';
import LeadMetricsCards from './LeadMetricsCards';
import LeadListView from './LeadListView';
import type { LeadFilters } from '@/lib/types/leads';
import {
  ViewColumnsIcon,
  ListBulletIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

type ViewType = 'kanban' | 'list' | 'funnel';

export default function LeadsDashboard() {
  const [view, setView] = useState<ViewType>('kanban');
  const [filters, setFilters] = useState<LeadFilters>({
    quality: null,
    caseType: null,
    assignedTo: null,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: leadsData, isLoading: leadsLoading } = useLeads({
    ...filters,
    search: searchQuery || null,
  });
  const { data: funnel, isLoading: funnelLoading } = useLeadFunnel();
  const { data: metrics, isLoading: metricsLoading } = useLeadMetrics();

  const leads = leadsData?.items ?? [];

  const viewButtons = [
    { key: 'kanban' as ViewType, icon: ViewColumnsIcon, label: 'Kanban' },
    { key: 'list' as ViewType, icon: ListBulletIcon, label: 'Lista' },
    { key: 'funnel' as ViewType, icon: FunnelIcon, label: 'Funil' },
  ];

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-sm text-gray-600">Gerencie e qualifique seus leads do WhatsApp</p>
          </div>

          {/* View Switcher */}
          <div className="flex gap-2">
            {viewButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setView(btn.key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                  view === btn.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={btn.label}
              >
                <btn.icon className="h-5 w-5" />
                <span className="hidden sm:inline">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="px-6 py-4">
        <LeadMetricsCards metrics={metrics} isLoading={metricsLoading} />
      </div>

      {/* Filtros */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative max-w-xs flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              aria-label="Buscar leads"
            />
          </div>

          {/* Filtro por Qualidade */}
          <select
            value={filters.quality || ''}
            onChange={(e) => setFilters({ ...filters, quality: e.target.value || null })}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            aria-label="Filtrar por qualidade"
            title="Filtrar por qualidade"
          >
            <option value="">Todas as Qualidades</option>
            <option value="High">🟢 Alta</option>
            <option value="Medium">🟡 Média</option>
            <option value="Low">🔴 Baixa</option>
          </select>

          {/* Filtro por Tipo de Caso */}
          <select
            value={filters.caseType || ''}
            onChange={(e) => setFilters({ ...filters, caseType: e.target.value || null })}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            aria-label="Filtrar por tipo de caso"
            title="Filtrar por tipo de caso"
          >
            <option value="">Todos os Tipos</option>
            <option value="Trabalhista">Trabalhista</option>
            <option value="Civil">Civil</option>
            <option value="Criminal">Criminal</option>
            <option value="Família">Família</option>
            <option value="Consumidor">Consumidor</option>
            <option value="Previdenciário">Previdenciário</option>
          </select>

          {/* Clear Filters */}
          {(filters.quality || filters.caseType || filters.assignedTo || searchQuery) && (
            <button
              onClick={() => {
                setFilters({ quality: null, caseType: null, assignedTo: null });
                setSearchQuery('');
              }}
              className="rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-hidden">
        {view === 'kanban' && <LeadKanbanBoard leads={leads} isLoading={leadsLoading} />}
        {view === 'list' && <LeadListView leads={leads} isLoading={leadsLoading} />}
        {view === 'funnel' && <LeadFunnelChart funnel={funnel} isLoading={funnelLoading} />}
      </div>
    </div>
  );
}
