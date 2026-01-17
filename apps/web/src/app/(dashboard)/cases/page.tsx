'use client';

import { Header } from '@/components/dashboard/Header';
import { FileText, Plus, Search, Filter, Loader2, MoreVertical, Briefcase, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { casesApi } from '@/services/api/cases';
import { useState } from 'react';
import { Case } from '@/types/cases';

export default function CasesPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['cases', searchTerm],
        queryFn: () => casesApi.getCases({ search: searchTerm }),
    });

    const { data: stats } = useQuery({
        queryKey: ['cases-stats'],
        queryFn: () => casesApi.getCaseStats(),
        initialData: { total: 0, active: 0, pending: 0, closed: 0 }
    });

    const cases = data?.items || [];
    const hasCases = cases.length > 0;

    return (
        <>
            <Header showSearch={false} />

            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Casos</h1>
                        <p className="text-gray-600 dark:text-gray-400">Gerencie seus processos jurídicos</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition">
                        <Plus className="w-5 h-5" />
                        Novo Caso
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total de Casos', value: stats.total.toString() },
                        { label: 'Em Andamento', value: stats.active.toString() },
                        { label: 'Aguardando', value: stats.pending.toString() },
                        { label: 'Concluídos', value: stats.closed.toString() },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Buscar casos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            <Filter className="w-4 h-4" />
                            Filtros
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
                ) : !hasCases ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum caso cadastrado</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Adicione casos para começar</p>
                        <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium">Adicionar Primeiro Caso</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {cases.map((caseItem: Case) => (
                            <div key={caseItem.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{caseItem.title}</h3>
                                            <p className="text-sm text-gray-500">CNJ: {caseItem.number}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-400"><MoreVertical className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
