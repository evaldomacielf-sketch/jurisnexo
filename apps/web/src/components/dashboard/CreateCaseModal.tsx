'use client';

import { useState } from 'react';
import { X, Save, FileText, User, Tag, Clock, DollarSign } from 'lucide-react';
import { useKanbanStore } from '@/lib/store/kanban-store';
import { CaseCategory, CasePriority } from '@/lib/types/kanban';
import toast from 'react-hot-toast';

export function CreateCaseModal() {
    const { isCreateModalOpen, closeCreateModal, addCard, createModalColumnId } = useKanbanStore();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        clientName: '',
        description: '',
        priority: 'medium' as CasePriority,
        category: 'civil' as CaseCategory,
        value: '',
    });

    if (!isCreateModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createModalColumnId) return;

        setIsLoading(true);

        try {
            // Simulate API delay since we are using local mock
            await new Promise(resolve => setTimeout(resolve, 500));

            addCard(createModalColumnId, {
                clientName: formData.clientName,
                description: formData.description,
                priority: formData.priority,
                category: formData.category,
                value: formData.value ? Number(formData.value) : 0,
                lastUpdate: new Date().toISOString(),
                status: createModalColumnId,
                assignedTo: {
                    name: 'Usuário Atual', // Placeholder
                    initials: 'UA',
                    avatar: null
                }
            });

            toast.success('Caso criado com sucesso!');
            closeCreateModal();
            setFormData({
                clientName: '',
                description: '',
                priority: 'medium',
                category: 'civil',
                value: '',
            });
        } catch (error) {
            toast.error('Erro ao criar caso');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={closeCreateModal}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Novo Caso
                        </h2>
                        <button
                            onClick={closeCreateModal}
                            aria-label="Fechar modal"
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">

                        {/* Client Name */}
                        <div>
                            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nome do Cliente
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                <input
                                    id="clientName"
                                    name="clientName"
                                    required
                                    value={formData.clientName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descrição / Assunto
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Detalhes do caso..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Área
                                </label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
                                    >
                                        <option value="civil">Cível</option>
                                        <option value="trabalhista">Trabalhista</option>
                                        <option value="criminal">Criminal</option>
                                        <option value="previdenciario">Previdenciário</option>
                                        <option value="familia">Família</option>
                                    </select>
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Prioridade
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
                                    >
                                        <option value="low">Baixa</option>
                                        <option value="medium">Média</option>
                                        <option value="high">Alta</option>
                                        <option value="critical">Urgente</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Value */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Valor da Causa (Opcional)
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                <input
                                    name="value"
                                    type="number"
                                    value={formData.value}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 mt-6">
                            <button
                                type="button"
                                onClick={closeCreateModal}
                                disabled={isLoading}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>Salvano...</>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Salvar Caso
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
