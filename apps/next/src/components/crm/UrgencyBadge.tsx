import React from 'react';

type UrgencyLevel = 'NORMAL' | 'HIGH' | 'PLANTAO';

interface UrgencyBadgeProps {
    urgency: UrgencyLevel;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency }) => {
    const styles = {
        NORMAL: 'bg-slate-100 text-slate-600 border-slate-200',
        HIGH: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        PLANTAO: 'bg-red-100 text-red-700 border-red-200 animate-pulse font-bold',
    };

    const labels = {
        NORMAL: 'Normal',
        HIGH: 'Alta',
        PLANTAO: '🚨 PLANTÃO 🚨',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs border ${styles[urgency] || styles.NORMAL}`}>
            {labels[urgency] || urgency}
        </span>
    );
};
