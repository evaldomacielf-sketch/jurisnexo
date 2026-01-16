'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Search, Filter, Plus, Calendar, User, AlertCircle } from 'lucide-react';
import { casesApi } from '@/lib/api/cases';
import { format } from 'date-fns';
import { Case, CaseStatus } from '@/lib/types/cases';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<CaseStatus, { label: string; color: string; bgColor: string }> = {
  [CaseStatus.ACTIVE]: { label: 'Ativo', color: 'text-green-700', bgColor: 'bg-green-50' },
  [CaseStatus.PENDING]: { label: 'Pendente', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  [CaseStatus.ARCHIVED]: { label: 'Arquivado', color: 'text-gray-700', bgColor: 'bg-gray-50' },
  [CaseStatus.CLOSED]: { label: 'Encerrado', color: 'text-red-700', bgColor: 'bg-red-50' },
};

export function CasesList() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  const loadCases = async () => {
    setIsLoading(true);
    try {
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const data = await casesApi.getCases(filters);
      setCases(data);
    } catch (error) {
      toast.error('Erro ao carregar processos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter cases by search
  const filteredCases = cases?.filter(
    (caseItem) =>
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateStr = (dateDate: string) => {
    try {
      return format(new Date(dateDate), 'dd/MM/yyyy');
    } catch {
      return dateDate;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            <Briefcase className="h-8 w-8" />
            Processos
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie todos os processos do escritório
          </p>
        </div>
        <button
          onClick={() => router.push('/casos/new')}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Processo
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  placeholder="Buscar por número, título ou cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
                />
              </div>
            </div>

            {/* Status filter */}
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'all')}
                title="Filtrar por status"
                className="box-border h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
              >
                <option value="all">Todos os Status</option>
                <option value={CaseStatus.ACTIVE}>Ativos</option>
                <option value={CaseStatus.PENDING}>Pendentes</option>
                <option value={CaseStatus.CLOSED}>Encerrados</option>
                <option value={CaseStatus.ARCHIVED}>Arquivados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          </CardContent>
        </Card>
      ) : filteredCases && filteredCases.length > 0 ? (
        <div className="grid gap-4">
          {filteredCases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/casos/${caseItem.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Main info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {caseItem.title}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 ${STATUS_CONFIG[caseItem.status]?.bgColor} ${STATUS_CONFIG[caseItem.status]?.color} border-transparent`}
                          >
                            {STATUS_CONFIG[caseItem.status]?.label || caseItem.status}
                          </span>
                          {caseItem.is_urgent && (
                            <span className="inline-flex items-center rounded-full border border-transparent bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Urgente
                            </span>
                          )}
                        </div>
                        {caseItem.case_number && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nº {caseItem.case_number}
                          </p>
                        )}
                      </div>
                    </div>

                    {caseItem.description && (
                      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                        {caseItem.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      {/* Cliente */}
                      {caseItem.client && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <User className="h-4 w-4" />
                          <span>{caseItem.client.name}</span>
                        </div>
                      )}

                      {/* Data de criação */}
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Criado em {formatDateStr(caseItem.created_at)}</span>
                      </div>

                      {/* Área do direito */}
                      {caseItem.practice_area && (
                        <span className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:border-gray-800 dark:text-gray-50">
                          {caseItem.practice_area}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {caseItem.tags && caseItem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {caseItem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-transparent bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-900 hover:bg-gray-200/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Responsible lawyer */}
                  {caseItem.responsible_lawyer && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {caseItem.responsible_lawyer.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Responsável</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pb-12 pt-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Briefcase className="mx-auto mb-4 h-16 w-16 opacity-20" />
              <p className="mb-2 text-lg font-medium">Nenhum processo encontrado</p>
              <p className="text-sm">
                {searchQuery || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Crie seu primeiro processo para começar'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
