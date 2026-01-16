'use client';

import { useQuery } from '@tanstack/react-query';
import { ExclamationCircleIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from '@/lib/axios';

// ============================================
// 🎯 Window 24h Indicator - WhatsApp Window Status
// ============================================

interface WindowStatus {
  isOpen: boolean;
  hoursRemaining: number | null;
  expiresAt: string | null;
  lastCustomerMessageAt: string | null;
  requiresTemplate: boolean;
}

interface Window24hIndicatorProps {
  conversationId: string;
  compact?: boolean;
}

export default function Window24hIndicator({
  conversationId,
  compact = false,
}: Window24hIndicatorProps) {
  const { data: windowStatus, isLoading } = useQuery<WindowStatus>({
    queryKey: ['window-status', conversationId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/whatsapp/conversations/${conversationId}/window-status`
      );
      return data;
    },
    refetchInterval: 60000, // Refresh every 1 minute
    enabled: !!conversationId,
  });

  if (isLoading) {
    return (
      <div className="flex animate-pulse items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-700">
        <div className="h-5 w-5 rounded bg-gray-300 dark:bg-gray-600" />
        <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-600" />
      </div>
    );
  }

  // Window expired
  if (!windowStatus?.isOpen) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 ${compact ? 'px-2 py-1' : 'px-3 py-2'}`}
      >
        <ExclamationCircleIcon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        <span className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
          {compact ? 'Template' : 'Janela Expirada - Use Template'}
        </span>
      </div>
    );
  }

  const hours = windowStatus.hoursRemaining ?? 0;
  const isExpiringSoon = hours < 2;
  const isWarning = hours < 6;

  // Format time remaining
  const formatTime = (h: number): string => {
    if (h >= 1) {
      return `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`;
    }
    return `${Math.round(h * 60)}min`;
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          isExpiringSoon
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : isWarning
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}
      >
        <ClockIcon className="h-3 w-3" />
        {formatTime(hours)}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
        isExpiringSoon
          ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          : isWarning
            ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
            : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      }`}
    >
      {isExpiringSoon ? (
        <ExclamationCircleIcon className="h-5 w-5" />
      ) : (
        <ClockIcon className="h-5 w-5" />
      )}
      <span className="text-sm font-semibold">
        {isExpiringSoon
          ? `⚠️ Expira em ${formatTime(hours)}`
          : `Janela ativa: ${formatTime(hours)} restantes`}
      </span>
    </div>
  );
}

// ============================================
// 🎯 Template Required Alert
// ============================================

interface TemplateRequiredAlertProps {
  onSelectTemplate: () => void;
}

export function TemplateRequiredAlert({ onSelectTemplate }: TemplateRequiredAlertProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <div className="flex items-start gap-3">
        <ExclamationCircleIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-800 dark:text-amber-200">
            Janela de 24h Expirada
          </h4>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            Para enviar uma mensagem, você precisa usar um template pré-aprovado pelo WhatsApp.
            Quando o cliente responder, a janela de 24h será reaberta.
          </p>
          <button
            onClick={onSelectTemplate}
            className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            Selecionar Template
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🎯 Window Status Hook
// ============================================

export function useWindowStatus(conversationId: string | undefined) {
  return useQuery<WindowStatus>({
    queryKey: ['window-status', conversationId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/whatsapp/conversations/${conversationId}/window-status`
      );
      return data;
    },
    refetchInterval: 60000,
    enabled: !!conversationId,
  });
}
