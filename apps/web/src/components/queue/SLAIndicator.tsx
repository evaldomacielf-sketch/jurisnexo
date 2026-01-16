'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// ============================================
// 🎯 SLA Indicator - Visual SLA Status
// ============================================

interface SLAIndicatorProps {
    conversation: {
        lastIncomingMessageAt?: string | null;
        lastCustomerMessageAt?: string | null;
        priority?: 'Low' | 'Medium' | 'High' | 'Critical';
    };
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function SLAIndicator({
    conversation,
    size = 'md',
    showLabel = true
}: SLAIndicatorProps) {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [percentage, setPercentage] = useState<number>(100);

    useEffect(() => {
        const calculateRemaining = () => {
            const now = new Date();
            const lastMessageStr = conversation.lastIncomingMessageAt || conversation.lastCustomerMessageAt;

            if (!lastMessageStr) {
                setTimeRemaining(getSLAMinutes(conversation.priority || 'Medium'));
                setPercentage(100);
                return;
            }

            const lastMessage = new Date(lastMessageStr);
            const elapsed = (now.getTime() - lastMessage.getTime()) / 1000 / 60; // minutes

            const slaMinutes = getSLAMinutes(conversation.priority || 'Medium');
            const remaining = slaMinutes - elapsed;
            const pct = (remaining / slaMinutes) * 100;

            setTimeRemaining(Math.max(0, remaining));
            setPercentage(Math.max(0, Math.min(100, pct)));
        };

        calculateRemaining();
        const interval = setInterval(calculateRemaining, 10000); // Update every 10s

        return () => clearInterval(interval);
    }, [conversation.lastIncomingMessageAt, conversation.lastCustomerMessageAt, conversation.priority]);

    const getSLAMinutes = (priority: string): number => {
        switch (priority.toLowerCase()) {
            case 'critical': return 15;
            case 'high': return 60;
            case 'medium': return 240;
            case 'low': return 1440;
            default: return 60;
        }
    };

    const getColorClasses = () => {
        if (percentage > 50) return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100' };
        if (percentage > 20) return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100' };
        return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100' };
    };

    const formatTime = (minutes: number): string => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = Math.floor(minutes % 60);
            return `${hours}h ${mins}m`;
        }
        return `${Math.floor(minutes)}min`;
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return { bar: 'h-1', text: 'text-xs', icon: 'w-3 h-3' };
            case 'lg': return { bar: 'h-3', text: 'text-base', icon: 'w-6 h-6' };
            default: return { bar: 'h-2', text: 'text-sm', icon: 'w-4 h-4' };
        }
    };

    const colors = getColorClasses();
    const sizes = getSizeClasses();
    const isBreached = timeRemaining <= 0;
    const isWarning = percentage < 20 && !isBreached;

    return (
        <div className="flex items-center gap-2">
            {/* Progress Bar */}
            <div className={`flex-1 ${sizes.bar} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-[60px]`}>
                <div
                    className={`h-full ${colors.bg} transition-all duration-1000 ease-linear sla-progress-${Math.round(percentage)}`}
                />
            </div>

            {/* Time Remaining / Status */}
            {showLabel && (
                <span className={`${sizes.text} font-semibold ${colors.text} whitespace-nowrap`}>
                    {isBreached ? 'VENCIDO' : formatTime(timeRemaining)}
                </span>
            )}

            {/* Status Icon */}
            {isBreached ? (
                <ExclamationTriangleIcon className={`${sizes.icon} text-red-500 animate-pulse`} />
            ) : isWarning ? (
                <ClockIcon className={`${sizes.icon} text-yellow-500`} />
            ) : percentage > 50 ? (
                <CheckCircleIcon className={`${sizes.icon} text-green-500`} />
            ) : null}
        </div>
    );
}

// ============================================
// 🎯 SLA Badge - Compact Version
// ============================================

interface SLABadgeProps {
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    lastMessageAt?: string | null;
}

export function SLABadge({ priority, lastMessageAt }: SLABadgeProps) {
    const [isBreached, setIsBreached] = useState(false);
    const [isWarning, setIsWarning] = useState(false);

    useEffect(() => {
        const check = () => {
            if (!lastMessageAt) return;

            const now = new Date();
            const lastMessage = new Date(lastMessageAt);
            const elapsed = (now.getTime() - lastMessage.getTime()) / 1000 / 60;

            const slaMinutes = {
                Critical: 15,
                High: 60,
                Medium: 240,
                Low: 1440,
            }[priority] || 60;

            const remaining = slaMinutes - elapsed;
            const pct = (remaining / slaMinutes) * 100;

            setIsBreached(remaining <= 0);
            setIsWarning(pct <= 20 && pct > 0);
        };

        check();
        const interval = setInterval(check, 30000);
        return () => clearInterval(interval);
    }, [priority, lastMessageAt]);

    if (isBreached) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full animate-pulse">
                <ExclamationTriangleIcon className="w-3 h-3" />
                SLA
            </span>
        );
    }

    if (isWarning) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                <ClockIcon className="w-3 h-3" />
                SLA
            </span>
        );
    }

    return null;
}

// ============================================
// 🎯 Priority Badge
// ============================================

interface PriorityBadgeProps {
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    const styles = {
        Critical: 'bg-red-100 text-red-700 border-red-200',
        High: 'bg-orange-100 text-orange-700 border-orange-200',
        Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Low: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const labels = {
        Critical: 'Crítico',
        High: 'Alto',
        Medium: 'Médio',
        Low: 'Baixo',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-full ${styles[priority]}`}>
            {labels[priority]}
        </span>
    );
}
