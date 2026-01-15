import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    trend?: string;
    loading?: boolean;
}

export function StatCard({ title, value, icon, trend, loading }: StatCardProps) {
    if (loading) {
        return (
            <div className="stat-card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
        );
    }

    return (
        <div className="stat-card">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 ${trend.startsWith('+') ? 'text-success' : 'text-error'}`}>
                            {trend} vs. mês anterior
                        </p>
                    )}
                </div>
                <div className="ml-4">{icon}</div>
            </div>
        </div>
    );
}
