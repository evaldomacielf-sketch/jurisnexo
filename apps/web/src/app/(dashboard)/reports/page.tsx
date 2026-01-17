'use client';

import { Header } from '@/components/dashboard/Header';
import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
    const reportTypes = [
        { title: 'Relatório Financeiro', description: 'Receitas, despesas e fluxo de caixa', icon: TrendingUp, color: 'green' },
        { title: 'Relatório de Casos', description: 'Status e produtividade por processo', icon: FileText, color: 'blue' },
        { title: 'Relatório de Clientes', description: 'Base de clientes e conversão', icon: BarChart3, color: 'purple' },
    ];

    const colorClasses: Record<string, { bg: string; icon: string }> = {
        green: { bg: 'bg-green-100 dark:bg-green-900/20', icon: 'text-green-600' },
        blue: { bg: 'bg-blue-100 dark:bg-blue-900/20', icon: 'text-blue-600' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-900/20', icon: 'text-purple-600' },
    };

    return (
        <>
            <Header showSearch={false} />

            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Relatórios</h1>
                    <p className="text-gray-600 dark:text-gray-400">Analise o desempenho do seu escritório</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reportTypes.map((report) => {
                        const Icon = report.icon;
                        const colors = colorClasses[report.color];
                        return (
                            <div key={report.title} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
                                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{report.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{report.description}</p>
                                <button className="flex items-center gap-2 text-primary font-medium text-sm hover:underline">
                                    <Download className="w-4 h-4" />
                                    Gerar Relatório
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum relatório gerado</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Selecione um tipo de relatório acima para começar</p>
                </div>
            </div>
        </>
    );
}
