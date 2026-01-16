import React from 'react';
import { Card } from '@/components/shared/Card';
import { useAnaliseHonorarios } from '../hooks/useHonorarios';
import {
    DollarSign,
    CheckCircle,
    Clock,
    AlertTriangle,
} from 'lucide-react';

interface HonorarioStatsProps {
    filters: any;
}

export const HonorarioStats: React.FC<HonorarioStatsProps> = ({ filters }) => {
    const { data: analise } = useAnaliseHonorarios(filters);

    const stats = [
        {
            label: 'Total a Receber',
            value: `R$ ${(analise?.total_pendente || 0).toFixed(2)}`,
            icon: DollarSign,
            color: 'text-blue-600 bg-blue-100',
        },
        {
            label: 'Recebido',
            value: `R$ ${(analise?.total_pago || 0).toFixed(2)}`,
            icon: CheckCircle,
            color: 'text-green-600 bg-green-100',
        },
        {
            label: 'Parcialmente Pago',
            value: `R$ ${(analise?.total_parcial || 0).toFixed(2)}`,
            icon: Clock,
            color: 'text-yellow-600 bg-yellow-100',
        },
        {
            label: 'Atrasados',
            value: analise?.total_atrasados || 0,
            icon: AlertTriangle,
            color: 'text-red-600 bg-red-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <div className="flex items-center">
                        <div className={`p-3 rounded-full ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
