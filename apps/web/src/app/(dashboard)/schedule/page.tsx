'use client';

import { Header } from '@/components/dashboard/Header';
import { Calendar, Plus, Clock } from 'lucide-react';

export default function SchedulePage() {
    return (
        <>
            <Header showSearch={false} />

            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Agenda</h1>
                        <p className="text-gray-600 dark:text-gray-400">Gerencie seus compromissos e audiências</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition">
                        <Plus className="w-5 h-5" />
                        Novo Evento
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum evento agendado</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Adicione compromissos, audiências e prazos</p>
                    <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition">
                        Agendar Primeiro Evento
                    </button>
                </div>
            </div>
        </>
    );
}
