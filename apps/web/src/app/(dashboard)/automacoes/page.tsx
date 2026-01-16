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
import {
  workflowsApi,
  Workflow,
  WorkflowStats,
  WorkflowTemplate,
  TriggerType,
} from '@/services/api/workflows.service';
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
      setWorkflows((prev) => prev.map((w) => (w.id === id ? updated : w)));
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await workflowsApi.duplicate(id);
      setWorkflows((prev) => [duplicated, ...prev]);
    } catch (error) {
      console.error('Error duplicating workflow:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este workflow?')) return;
    try {
      await workflowsApi.delete(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
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
      setWorkflows((prev) => [created, ...prev]);
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

  const filteredWorkflows = workflows.filter((w) => {
    if (filter === 'active') return w.isActive;
    if (filter === 'inactive') return !w.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <div className="rounded-lg bg-indigo-100 p-2">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              Automações
            </h1>
            <p className="mt-1 text-gray-500">Configure fluxos de trabalho automatizados</p>
          </div>
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5" />
            Novo Workflow
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-8 grid grid-cols-4 gap-4">
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalWorkflows}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeWorkflows}</p>
                  <p className="text-sm text-gray-500">Ativos</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <Play className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</p>
                  <p className="text-sm text-gray-500">Execuções</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
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
        <div className="mb-6 flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === f
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
            <div className="rounded-xl border bg-white p-12 text-center">
              <Zap className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">Nenhum workflow</h3>
              <p className="mb-6 text-gray-500">
                Crie seu primeiro workflow para automatizar tarefas
              </p>
              <button
                onClick={() => setShowTemplates(true)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
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
                  className={`rounded-xl border bg-white p-4 transition-shadow hover:shadow-md ${
                    !workflow.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Status Toggle */}
                      <button
                        onClick={() => handleToggle(workflow.id)}
                        className={`rounded-lg p-2 transition-colors ${
                          workflow.isActive
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        aria-label={workflow.isActive ? 'Desativar' : 'Ativar'}
                      >
                        {workflow.isActive ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Pause className="h-5 w-5" />
                        )}
                      </button>

                      {/* Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <TriggerIcon className="h-4 w-4" />
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
                          className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                          aria-label="Executar"
                        >
                          <Play className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicate(workflow.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Duplicar"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(workflow.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Configurar"
                      >
                        <ChevronRight className="h-5 w-5" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
              <div className="sticky top-0 border-b bg-white p-6">
                <h2 className="text-xl font-bold text-gray-900">Escolha um Template</h2>
                <p className="mt-1 text-sm text-gray-500">Comece com um workflow pré-configurado</p>
              </div>
              <div className="space-y-4 p-6">
                {templates.map((template) => {
                  const TriggerIcon = TRIGGER_ICONS[template.trigger.type] || Zap;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleCreateFromTemplate(template)}
                      className="w-full rounded-xl border p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-indigo-100 p-2">
                          <TriggerIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                          <p className="mt-2 text-xs text-indigo-600">
                            {template.steps.length} ações configuradas
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="sticky bottom-0 border-t bg-gray-50 p-4">
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
