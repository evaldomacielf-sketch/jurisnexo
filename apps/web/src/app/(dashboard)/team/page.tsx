'use client';

import { Header } from '@/components/dashboard/Header';
import { Users, UserPlus, Mail, Phone } from 'lucide-react';

export default function TeamPage() {
    const currentUser = {
        name: 'Dr. Ricardo Silva',
        initials: 'DR',
        role: 'Admin',
        position: 'Sócio Diretor',
        email: 'ricardo@silvaadvocacia.com',
        phone: '(11) 98765-4321',
    };

    return (
        <>
            <Header showSearch={false} />

            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Equipe</h1>
                        <p className="text-gray-600 dark:text-gray-400">Gerencie os membros da sua equipe</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition">
                        <UserPlus className="w-5 h-5" />
                        Convidar Membro
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {currentUser.initials}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{currentUser.name}</h3>
                                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{currentUser.role}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{currentUser.position}</p>
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{currentUser.email}</div>
                                    <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{currentUser.phone}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-full md:col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Convide sua equipe</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Adicione advogados e assistentes</p>
                        <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium">Enviar Convite</button>
                    </div>
                </div>
            </div>
        </>
    );
}
