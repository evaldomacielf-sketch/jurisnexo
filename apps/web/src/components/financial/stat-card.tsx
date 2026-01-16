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
        <div className="mb-4 h-4 w-2/3 rounded bg-gray-200"></div>
        <div className="h-8 w-full rounded bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-1 text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`mt-2 text-sm ${trend.startsWith('+') ? 'text-success' : 'text-error'}`}>
              {trend} vs. mês anterior
            </p>
          )}
        </div>
        <div className="ml-4">{icon}</div>
      </div>
    </div>
  );
}
