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

export default function Window24hIndicator({ conversationId, compact = false }: Window24hIndicatorProps) {
    const { data: windowStatus, isLoading } = useQuery<WindowStatus>({
        queryKey: ['window-status', conversationId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/whatsapp/conversations/${conversationId}/window-status`);
            return data;
        },
        refetchInterval: 60000, // Refresh every 1 minute
        enabled: !!conversationId,
    });

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
        );
    }

    // Window expired
    if (!windowStatus?.isOpen) {
        return (
            <div className={`flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg ${compact ? 'px-2 py-1' : 'px-3 py-2'}`}>
                <ExclamationCircleIcon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
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
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isExpiringSoon
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : isWarning
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                <ClockIcon className="w-3 h-3" />
                {formatTime(hours)}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isExpiringSoon
                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : isWarning
                    ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            }`}>
            {isExpiringSoon ? (
                <ExclamationCircleIcon className="w-5 h-5" />
            ) : (
                <ClockIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">
                {isExpiringSoon
                    ? `⚠️ Expira em ${formatTime(hours)}`
                    : `Janela ativa: ${formatTime(hours)} restantes`
                }
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
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                        Janela de 24h Expirada
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Para enviar uma mensagem, você precisa usar um template pré-aprovado pelo WhatsApp.
                        Quando o cliente responder, a janela de 24h será reaberta.
                    </p>
                    <button
                        onClick={onSelectTemplate}
                        className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
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
            const { data } = await axios.get(`/api/whatsapp/conversations/${conversationId}/window-status`);
            return data;
        },
        refetchInterval: 60000,
        enabled: !!conversationId,
    });
}
