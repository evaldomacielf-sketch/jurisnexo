'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Edit,
  Trash2,
  User,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { casesApi } from '@/lib/api/cases';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { Case } from '@/lib/types/cases';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CaseDetailsProps {
  caseId: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Ativo', color: 'text-green-700', bgColor: 'bg-green-50' },
  pending: { label: 'Pendente', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  archived: { label: 'Arquivado', color: 'text-gray-700', bgColor: 'bg-gray-50' },
  closed: { label: 'Encerrado', color: 'text-red-700', bgColor: 'bg-red-50' },
};

export function CaseDetails({ caseId }: CaseDetailsProps) {
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents'>('timeline');

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const loadCase = async () => {
    try {
      setLoading(true);
      const data = await casesApi.getCaseById(caseId);
      setCaseData(data);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error('Erro ao carregar dados do processo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await casesApi.deleteCase(caseId);
      toast.success('Processo removido com sucesso');
      router.push('/casos');
    } catch (err) {
      toast.error('Erro ao remover processo');
    }
  };

  const formatDateStr = (dateDate?: string) => {
    if (!dateDate) return '-';
    try {
      return format(new Date(dateDate), 'dd/MM/yyyy HH:mm');
    } catch {
      return dateDate;
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <p>Erro ao carregar dados do processo</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/casos')}
          className="flex items-center text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {caseData.title}
            {caseData.is_urgent && (
              <span className="inline-flex items-center rounded-full border border-transparent bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
                <AlertCircle className="mr-1 h-3 w-3" />
                Urgente
              </span>
            )}
          </h1>
          {caseData.case_number && (
            <p className="text-gray-500 dark:text-gray-400">Nº {caseData.case_number}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/casos/${caseId}/edit`)}
            className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status e Informações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informações do Processo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CONFIG[caseData.status]?.bgColor || 'bg-gray-100'} ${STATUS_CONFIG[caseData.status]?.color || 'text-gray-800'}`}
                >
                  {STATUS_CONFIG[caseData.status]?.label || caseData.status}
                </span>
              </div>
            </div>

            {caseData.practice_area && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Área do Direito
                </p>
                <p className="mt-1 text-gray-900 dark:text-white">{caseData.practice_area}</p>
              </div>
            )}

            {caseData.description && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Descrição</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                  {caseData.description}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-gray-100 pt-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Criado em {formatDateStr(caseData.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Cliente e Responsável */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Partes Envolvidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseData.client && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Cliente</p>
                <div
                  className="cursor-pointer rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  onClick={() =>
                    caseData.client?.id && router.push(`/clientes/${caseData.client.id}`)
                  }
                >
                  <p className="font-medium text-gray-900 dark:text-white">
                    {caseData.client?.name || 'Cliente não identificado'}
                  </p>
                  {/* Assuming client object might have phone if enriched, otherwise just name */}
                </div>
              </div>
            )}

            {caseData.responsible_lawyer && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Advogado Responsável
                </p>
                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {caseData.responsible_lawyer.name}
                  </p>
                  {/* Assuming lawyer object might have email */}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              } flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
            >
              <Clock className="h-4 w-4" />
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              } flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
            >
              <FileText className="h-4 w-4" />
              Documentos
            </button>
          </nav>
        </div>

        {activeTab === 'timeline' && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Timeline de eventos será implementada
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'documents' && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Gestão de documentos será implementada
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Remover processo
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Tem certeza que deseja remover o processo &quot;{caseData.title}&quot;? Esta ação não
              pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDeleteModal(false);
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
