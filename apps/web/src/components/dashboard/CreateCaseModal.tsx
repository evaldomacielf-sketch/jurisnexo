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
      await new Promise((resolve) => setTimeout(resolve, 500));

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
          avatar: null,
        },
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm duration-200 animate-in fade-in"
        onClick={closeCreateModal}
      />

      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="pointer-events-auto max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl duration-200 animate-in zoom-in-95 dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Novo Caso</h2>
            <button
              onClick={closeCreateModal}
              aria-label="Fechar modal"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="max-h-[calc(90vh-140px)] space-y-4 overflow-y-auto p-6"
          >
            {/* Client Name */}
            <div>
              <label
                htmlFor="clientName"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nome do Cliente
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  id="clientName"
                  name="clientName"
                  required
                  value={formData.clientName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: João Silva"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Descrição / Assunto
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Detalhes do caso..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Área
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-9 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                <label
                  htmlFor="priority"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Prioridade
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-9 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor da Causa (Opcional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  name="value"
                  type="number"
                  value={formData.value}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={isLoading}
                className="rounded-lg px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-opacity-90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>Salvano...</>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
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
