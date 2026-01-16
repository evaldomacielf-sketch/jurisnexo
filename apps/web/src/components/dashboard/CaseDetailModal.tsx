'use client';

import { X, Calendar, User, Tag, Clock, Trash2, Edit, MessageSquare } from 'lucide-react';
import { useKanbanStore } from '@/lib/store/kanban-store';
import { CATEGORY_CONFIG } from '@/lib/types/kanban';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

// ============================================
// 📱 Case Detail Modal
// ============================================

export function CaseDetailModal() {
    const { selectedCard, selectCard, deleteCard } = useKanbanStore();

    if (!selectedCard) return null;

    const categoryConfig = CATEGORY_CONFIG[selectedCard.category];

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir este caso?')) {
            deleteCard(selectedCard.id);
            selectCard(null);
            toast.success('Caso excluído com sucesso', { icon: '🗑️' });
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={() => selectCard(null)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex-1 min-w-0 pr-4">
                            <span
                                className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${categoryConfig.color} ${categoryConfig.bgColor} mb-3`}
                            >
                                {categoryConfig.label}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {selectedCard.clientName}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Caso #{selectedCard.id}
                            </p>
                        </div>
                        <button
                            onClick={() => selectCard(null)}
                            aria-label="Fechar modal"
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Descrição
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {selectedCard.description}
                            </p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Status */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    Status
                                </p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {selectedCard.status}
                                </p>
                            </div>

                            {/* Priority */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Prioridade
                                </p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {selectedCard.priority || 'Normal'}
                                </p>
                            </div>

                            {/* Last Update */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Última Atualização
                                </p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {format(selectedCard.lastUpdate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                            </div>

                            {/* Assigned To */}
                            {selectedCard.assignedTo && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        Responsável
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                            {selectedCard.assignedTo.initials}
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {selectedCard.assignedTo.name}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Timeline (Placeholder) */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                                Linha do Tempo
                            </h3>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                                    <div>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                            Caso criado
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {format(selectedCard.lastUpdate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            Excluir Caso
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={() => selectCard(null)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                            >
                                Fechar
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium">
                                <Edit className="w-4 h-4" />
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
