'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UsersIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useQueueStats, useMyAssignments, useAcceptNextConversation } from '@/hooks/useQueue';

// ============================================
// 🎯 Queue Dashboard - Painel de Controle
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'yellow' | 'blue' | 'purple' | 'green' | 'red';
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  const colorStyles = {
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  const iconStyles = {
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${colorStyles[color]} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`rounded-lg p-3 ${iconStyles[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export default function QueueDashboard() {
  const router = useRouter();
  const { data: queueStats, refetch, isLoading } = useQueueStats();
  const { data: myAssignments } = useMyAssignments();
  const acceptNextMutation = useAcceptNextConversation();

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(refetch, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleAcceptNext = async () => {
    try {
      const result = await acceptNextMutation.mutateAsync();
      if (result.conversationId) {
        toast.success('Conversa atribuída com sucesso!');
        router.push(`/whatsapp?conversation=${result.conversationId}`);
      } else {
        toast('Nenhuma conversa na fila no momento', { icon: 'ℹ️' });
      }
    } catch (error) {
      toast.error('Erro ao aceitar conversa');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fila de Atendimento</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie conversas aguardando atendimento
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Atualizar"
            aria-label="Atualizar fila"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleAcceptNext}
            disabled={queueStats?.waitingCount === 0 || acceptNextMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {acceptNextMutation.isPending ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircleIcon className="h-5 w-5" />
            )}
            Aceitar Próxima Conversa
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Aguardando"
          value={queueStats?.waitingCount || 0}
          icon={ClockIcon}
          color="yellow"
          subtitle={
            queueStats?.criticalInQueue ? `${queueStats.criticalInQueue} críticos` : undefined
          }
        />
        <StatCard
          title="Em Atendimento"
          value={queueStats?.activeCount || 0}
          icon={ChatBubbleLeftRightIcon}
          color="blue"
        />
        <StatCard
          title="Tempo Médio"
          value={`${Math.round(queueStats?.avgWaitTimeMinutes || 0)} min`}
          icon={ChartBarIcon}
          color="purple"
          subtitle={
            queueStats?.longestWaitTimeMinutes
              ? `Maior: ${Math.round(queueStats.longestWaitTimeMinutes)}min`
              : undefined
          }
        />
        <StatCard
          title="Advogados Disponíveis"
          value={queueStats?.advogadosDisponiveis || 0}
          icon={UsersIcon}
          color="green"
          subtitle={`${queueStats?.advogadosOcupados || 0} ocupados`}
        />
      </div>

      {/* Priority Breakdown */}
      {queueStats && queueStats.waitingCount > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Fila por Prioridade
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
              <span className="text-2xl font-bold text-red-600">{queueStats.criticalInQueue}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">Crítico (15min)</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 text-center dark:bg-orange-900/20">
              <span className="text-2xl font-bold text-orange-600">{queueStats.highInQueue}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alto (1h)</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4 text-center dark:bg-yellow-900/20">
              <span className="text-2xl font-bold text-yellow-600">{queueStats.mediumInQueue}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">Médio (4h)</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-700">
              <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {queueStats.lowInQueue}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">Baixo (24h)</p>
            </div>
          </div>
        </div>
      )}

      {/* My Active Conversations */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Minhas Conversas Ativas ({myAssignments?.length || 0})
        </h2>

        {myAssignments?.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <ChatBubbleLeftRightIcon className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>Nenhuma conversa ativa no momento</p>
            <p className="text-sm">Clique em &quot;Aceitar Próxima Conversa&quot; para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myAssignments?.map((assignment) => (
              <div
                key={assignment.id}
                className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                onClick={() => router.push(`/whatsapp?conversation=${assignment.conversationId}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  router.push(`/whatsapp?conversation=${assignment.conversationId}`)
                }
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 font-bold text-white">
                      {assignment.contact.name.charAt(0).toUpperCase()}
                    </div>
                    {assignment.hasUnread && (
                      <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-red-500 dark:border-gray-800" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {assignment.contact.name}
                    </h3>
                    <p className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400">
                      {assignment.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(assignment.lastMessageAt)}
                  </div>
                  {assignment.slaWarning && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                      <ExclamationTriangleIcon className="h-3 w-3" />
                      SLA vencendo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
