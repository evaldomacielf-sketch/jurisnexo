'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Play,
    Pause,
    Copy,
    Trash2,
    Settings,
    Zap,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ChevronRight,
    Mail,
    Bell,
    FileText,
    Calendar,
    Webhook,
    DollarSign,
    User,
    Briefcase,
    Loader2,
} from 'lucide-react';
import { workflowsApi, Workflow, WorkflowStats, WorkflowTemplate, TriggerType } from '@/services/api/workflows.service';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TRIGGER_ICONS: Record<string, any> = {
    case_created: Briefcase,
    case_status_changed: Briefcase,
    case_deadline_approaching: Clock,
    client_created: User,
    client_updated: User,
    payment_received: DollarSign,
    payment_overdue: AlertTriangle,
    invoice_created: FileText,
    document_uploaded: FileText,
    appointment_created: Calendar,
    appointment_reminder: Bell,
    manual: Play,
    scheduled: Clock,
};

const TRIGGER_LABELS: Record<string, string> = {
    case_created: 'Novo Processo',
    case_status_changed: 'Status Alterado',
    case_deadline_approaching: 'Prazo Próximo',
    client_created: 'Novo Cliente',
    client_updated: 'Cliente Atualizado',
    payment_received: 'Pagamento Recebido',
    payment_overdue: 'Pagamento Atrasado',
    invoice_created: 'Nova Fatura',
    document_uploaded: 'Documento Enviado',
    appointment_created: 'Nova Consulta',
    appointment_reminder: 'Lembrete de Consulta',
    manual: 'Manual',
    scheduled: 'Agendado',
};

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [stats, setStats] = useState<WorkflowStats | null>(null);
    const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTemplates, setShowTemplates] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [workflowsData, statsData, templatesData] = await Promise.all([
                workflowsApi.getAll(),
                workflowsApi.getStats(),
                workflowsApi.getTemplates(),
            ]);
            setWorkflows(workflowsData);
            setStats(statsData);
            setTemplates(templatesData);
        } catch (error) {
            console.error('Error loading workflows:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const updated = await workflowsApi.toggle(id);
            setWorkflows(prev => prev.map(w => w.id === id ? updated : w));
        } catch (error) {
            console.error('Error toggling workflow:', error);
        }
    };

    const handleDuplicate = async (id: string) => {
        try {
            const duplicated = await workflowsApi.duplicate(id);
            setWorkflows(prev => [duplicated, ...prev]);
        } catch (error) {
            console.error('Error duplicating workflow:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este workflow?')) return;
        try {
            await workflowsApi.delete(id);
            setWorkflows(prev => prev.filter(w => w.id !== id));
        } catch (error) {
            console.error('Error deleting workflow:', error);
        }
    };

    const handleCreateFromTemplate = async (template: WorkflowTemplate) => {
        try {
            const created = await workflowsApi.create({
                name: template.name,
                description: template.description,
                trigger: template.trigger,
                steps: template.steps,
                isActive: false,
            });
            setWorkflows(prev => [created, ...prev]);
            setShowTemplates(false);
        } catch (error) {
            console.error('Error creating from template:', error);
        }
    };

    const handleExecute = async (id: string) => {
        try {
            await workflowsApi.execute(id, { manualExecution: true });
            alert('Workflow executado com sucesso!');
        } catch (error) {
            console.error('Error executing workflow:', error);
        }
    };

    const filteredWorkflows = workflows.filter(w => {
        if (filter === 'active') return w.isActive;
        if (filter === 'inactive') return !w.isActive;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Zap className="w-6 h-6 text-indigo-600" />
                            </div>
                            Automações
                        </h1>
                        <p className="text-gray-500 mt-1">Configure fluxos de trabalho automatizados</p>
                    </div>
                    <button
                        onClick={() => setShowTemplates(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Workflow
                    </button>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-4 border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalWorkflows}</p>
                                    <p className="text-sm text-gray-500">Total</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.activeWorkflows}</p>
                                    <p className="text-sm text-gray-500">Ativos</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Play className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</p>
                                    <p className="text-sm text-gray-500">Execuções</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                                    <p className="text-sm text-gray-500">Taxa Sucesso</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'active', 'inactive'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : 'Inativos'}
                        </button>
                    ))}
                </div>

                {/* Workflows List */}
                <div className="space-y-4">
                    {filteredWorkflows.length === 0 ? (
                        <div className="bg-white rounded-xl border p-12 text-center">
                            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum workflow</h3>
                            <p className="text-gray-500 mb-6">Crie seu primeiro workflow para automatizar tarefas</p>
                            <button
                                onClick={() => setShowTemplates(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Criar Workflow
                            </button>
                        </div>
                    ) : (
                        filteredWorkflows.map((workflow) => {
                            const TriggerIcon = TRIGGER_ICONS[workflow.trigger.type] || Zap;
                            return (
                                <div
                                    key={workflow.id}
                                    className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${!workflow.isActive ? 'opacity-60' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Status Toggle */}
                                            <button
                                                onClick={() => handleToggle(workflow.id)}
                                                className={`p-2 rounded-lg transition-colors ${workflow.isActive
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-gray-100 text-gray-400'
                                                    }`}
                                                aria-label={workflow.isActive ? 'Desativar' : 'Ativar'}
                                            >
                                                {workflow.isActive ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <Pause className="w-5 h-5" />
                                                )}
                                            </button>

                                            {/* Info */}
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <TriggerIcon className="w-4 h-4" />
                                                        {TRIGGER_LABELS[workflow.trigger.type]}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{workflow.steps.length} ações</span>
                                                    {workflow.executionCount && workflow.executionCount > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{workflow.executionCount} execuções</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {workflow.isActive && workflow.trigger.type === 'manual' && (
                                                <button
                                                    onClick={() => handleExecute(workflow.id)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                    aria-label="Executar"
                                                >
                                                    <Play className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDuplicate(workflow.id)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                aria-label="Duplicar"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(workflow.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                aria-label="Excluir"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Configurar">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Templates Modal */}
                {showTemplates && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="p-6 border-b sticky top-0 bg-white">
                                <h2 className="text-xl font-bold text-gray-900">Escolha um Template</h2>
                                <p className="text-gray-500 text-sm mt-1">Comece com um workflow pré-configurado</p>
                            </div>
                            <div className="p-6 space-y-4">
                                {templates.map((template) => {
                                    const TriggerIcon = TRIGGER_ICONS[template.trigger.type] || Zap;
                                    return (
                                        <button
                                            key={template.id}
                                            onClick={() => handleCreateFromTemplate(template)}
                                            className="w-full p-4 border rounded-xl text-left hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                    <TriggerIcon className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                                                    <p className="text-xs text-indigo-600 mt-2">
                                                        {template.steps.length} ações configuradas
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="p-4 border-t bg-gray-50 sticky bottom-0">
                                <button
                                    onClick={() => setShowTemplates(false)}
                                    className="w-full py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
