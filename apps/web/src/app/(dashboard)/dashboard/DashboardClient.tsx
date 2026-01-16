'use client';

import { useState, useEffect } from 'react';
import { LeaderboardWidget } from '@/components/gamification/LeaderboardWidget';
import { Modal } from '@/components/ui/modal';

export default function DashboardClient() {
    const [kanbanData, setKanbanData] = useState<{ columns: any[] }>({ columns: [] });
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<any>(null);

    useEffect(() => {
        // Fetch Kanban Data
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/crm/kanban`)
            .then(res => res.json())
            .then(data => {
                setKanbanData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch kanban data", err);
                setLoading(false);
            });
    }, []);

    // Helper functions for styles
    const getTagColor = (color: string) => {
        const colors: any = {
            blue: "text-blue-600 bg-blue-600/10",
            orange: "text-orange-600 bg-orange-100",
            green: "text-green-600 bg-green-100",
            purple: "text-purple-600 bg-purple-100",
            red: "text-red-600 bg-red-100",
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="flex flex-1 h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
                <div className="flex gap-6 h-full min-h-[600px] pb-8">
                    {loading ? (
                        <div className="flex w-full items-center justify-center text-gray-500">Caregando quadros...</div>
                    ) : (
                        kanbanData?.columns?.map((column: any) => (
                            <div key={column.id} className="kanban-column flex flex-col gap-4 flex-1">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">{column.title}</h4>
                                        <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full font-bold text-gray-700">{column.cards.length}</span>
                                    </div>
                                    <button className="text-[#616f89] hover:text-blue-600" onClick={() => alert('Criar novo card não implementado na demo')}><span className="material-symbols-outlined text-xl">add</span></button>
                                </div>
                                <div className="flex-1 bg-[#f0f2f4]/50 dark:bg-gray-800/20 rounded-xl p-3 space-y-3 overflow-y-auto">
                                    {column.cards.map((card: any) => (
                                        <div
                                            key={card.id}
                                            onClick={() => setSelectedCard(card)}
                                            className="bg-white dark:bg-[#1a2130] p-4 rounded-lg border border-[#dbdfe6] dark:border-[#2d3748] shadow-sm hover:border-blue-600 transition-colors cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] uppercase tracking-wider font-bold ${getTagColor(card.tagColor)} px-2 py-0.5 rounded`}>{card.tag}</span>
                                                <span className="material-symbols-outlined text-gray-400 text-lg">more_horiz</span>
                                            </div>
                                            <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100">{card.title}</h5>
                                            <p className="text-xs text-[#616f89] mt-1 line-clamp-2">{card.description}</p>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex -space-x-2">
                                                    {card.avatar ? (
                                                        <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">{card.avatar}</div>
                                                    ) : (
                                                        <div className="size-6 rounded-full border-2 border-white dark:border-[#1a2130] bg-gray-200"></div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-[#616f89]">
                                                    {card.priority === 'urgent' && <span className="material-symbols-outlined text-sm text-red-500">priority_high</span>}
                                                    {card.priority === 'urgent' ? <span className="text-red-500 font-bold uppercase">Urgente</span> :
                                                        card.priority === 'updated' ? <span className="text-green-600 font-bold uppercase flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span>Atualizado</span> :
                                                            card.priority === 'review' ? <span className="text-orange-600 font-bold uppercase flex items-center gap-1"><span className="material-symbols-outlined text-sm">history_edu</span>Revisão</span> :
                                                                <span>{card.time}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Sidebar */}
            <aside className="w-80 bg-white dark:bg-[#1a2130] border-l border-[#dbdfe6] dark:border-[#2d3748] flex flex-col shrink-0">
                <div className="p-6 border-b border-[#dbdfe6] dark:border-[#2d3748] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="size-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                        </svg>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">WhatsApp</h4>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-[#616f89] font-bold uppercase tracking-widest">Ativo</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 border-b border-[#f0f2f4] dark:border-[#2d3748]">
                        <LeaderboardWidget />
                    </div>
                    <div className="p-6 border-b border-[#f0f2f4] dark:border-[#2d3748]">
                        <h5 className="text-xs font-bold text-[#616f89] uppercase tracking-wider mb-4">Convites Pendentes</h5>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-[#dbdfe6] dark:border-[#2d3748]">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 text-xs font-bold">FA</div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold truncate text-gray-900 dark:text-gray-100">Fernanda Almeida</p>
                                        <p className="text-[10px] text-[#616f89]">Enviado há 2h</p>
                                    </div>
                                </div>
                                <button className="text-[#616f89] hover:text-red-500"><span className="material-symbols-outlined text-lg">close</span></button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-600/5 border-b border-[#f0f2f4] dark:border-[#2d3748]">
                        <div className="flex gap-3">
                            <div className="shrink-0 size-11 rounded-full bg-gray-200"></div>
                            <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-bold truncate text-gray-900 dark:text-gray-100">João Pereira</h5>
                                <p className="text-xs text-[#111318] dark:text-gray-300">Você já revisou o contrato?</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Selected Card Modal */}
            <Modal isOpen={!!selectedCard} onClose={() => setSelectedCard(null)} title={selectedCard?.title}>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className={`text-xs uppercase tracking-wider font-bold ${selectedCard ? getTagColor(selectedCard.tagColor) : ''} px-2 py-1 rounded`}>
                            {selectedCard?.tag}
                        </span>
                        {selectedCard?.priority === 'urgent' && (
                            <span className="flex items-center gap-1 text-red-500 font-bold text-xs uppercase">
                                <span className="material-symbols-outlined text-sm">priority_high</span> Urgente
                            </span>
                        )}
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Descrição</h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            {selectedCard?.description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                {selectedCard?.avatar || 'U'}
                            </div>
                            <div className="text-xs text-gray-500">
                                <p>Responsável</p>
                                <p className="font-bold text-gray-900 dark:text-white">Usuário Demo</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                            <p>Atualizado</p>
                            <p className="font-bold text-gray-900 dark:text-white">{selectedCard?.time || 'Recentemente'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button className="flex items-center justify-center gap-2 h-10 rounded-lg border border-gray-200 dark:border-gray-700 font-bold text-xs text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined text-base">edit</span>
                            Editar
                        </button>
                        <button className="flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                            <span className="material-symbols-outlined text-base">chat</span>
                            Abrir Chat
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
