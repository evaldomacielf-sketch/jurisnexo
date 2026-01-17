'use client';

import { Header } from '@/components/dashboard/Header';
import { Bell, Shield, Palette, Building2 } from 'lucide-react';

export default function SettingsPage() {
    const settingsCards = [
        { title: 'Dados do Escritório', description: 'Nome, logo, informações de contato', icon: Building2, color: 'blue' },
        { title: 'Notificações', description: 'Configure alertas e avisos', icon: Bell, color: 'yellow' },
        { title: 'Segurança', description: 'Senha e autenticação', icon: Shield, color: 'red' },
        { title: 'Aparência', description: 'Tema e cores', icon: Palette, color: 'purple' },
    ];

    const colorClasses: Record<string, { bg: string; icon: string }> = {
        blue: { bg: 'bg-blue-100 dark:bg-blue-900/20', icon: 'text-blue-600' },
        yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', icon: 'text-yellow-600' },
        red: { bg: 'bg-red-100 dark:bg-red-900/20', icon: 'text-red-600' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-900/20', icon: 'text-purple-600' },
    };

    return (
        <>
            <Header showSearch={false} />

            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Configurações</h1>
                    <p className="text-gray-600 dark:text-gray-400">Personalize o sistema do seu escritório</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {settingsCards.map((card) => {
                        const Icon = card.icon;
                        const colors = colorClasses[card.color];
                        return (
                            <div key={card.title} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{card.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{card.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Plano Trial</h3>
                            <p className="text-blue-100">7 dias restantes • Atualize para acesso ilimitado</p>
                        </div>
                        <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition">Fazer Upgrade</button>
                    </div>
                </div>
            </div>
        </>
    );
}
