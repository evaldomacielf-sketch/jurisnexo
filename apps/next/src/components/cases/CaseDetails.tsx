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
    X
} from 'lucide-react';
import { casesApi } from '@/lib/api/cases';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { Case, CaseStatus } from '@/lib/types/cases';
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
            router.push('/dashboard/cases');
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
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
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
                    onClick={() => router.push('/dashboard/cases')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3 flex-wrap">
                        {caseData.title}
                        {caseData.is_urgent && (
                            <span className="inline-flex items-center rounded-full border border-transparent bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
                                <AlertCircle className="h-3 w-3 mr-1" />
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
                        onClick={() => router.push(`/dashboard/cases/${caseId}/edit`)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
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
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CONFIG[caseData.status]?.bgColor || 'bg-gray-100'} ${STATUS_CONFIG[caseData.status]?.color || 'text-gray-800'}`}>
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
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Descrição
                                </p>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                    {caseData.description}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
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
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Cliente
                                </p>
                                <div
                                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                    onClick={() => router.push(`/dashboard/clients/${caseData.client.id}`)}
                                >
                                    <p className="font-medium text-gray-900 dark:text-white">{caseData.client.name}</p>
                                    {/* Assuming client object might have phone if enriched, otherwise just name */}
                                </div>
                            </div>
                        )}

                        {caseData.responsible_lawyer && (
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Advogado Responsável
                                </p>
                                <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="font-medium text-gray-900 dark:text-white">{caseData.responsible_lawyer.name}</p>
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
                            className={`${activeTab === 'timeline'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            <Clock className="h-4 w-4" />
                            Timeline
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`${activeTab === 'documents'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Remover processo
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Tem certeza que deseja remover o processo "{caseData.title}"? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    handleDelete();
                                    setShowDeleteModal(false);
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
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
