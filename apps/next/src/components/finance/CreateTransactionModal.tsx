'use client';

import { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Calendar, DollarSign } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    color?: string;
}

interface Account {
    id: string;
    name: string;
}

interface TransactionFormData {
    type: 'INCOME' | 'EXPENSE';
    description: string;
    amount: number;
    date: string;
    due_date?: string;
    category_id?: string;
    account_id?: string;
    notes?: string;
}

interface CreateTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TransactionFormData) => Promise<void>;
    categories: Category[];
    accounts: Account[];
}

export function CreateTransactionModal({
    isOpen,
    onClose,
    onSubmit,
    categories,
    accounts,
}: CreateTransactionModalProps) {
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [formData, setFormData] = useState<TransactionFormData>({
        type: 'EXPENSE',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({ ...formData, type });
            onClose();
            // Reset form
            setFormData({
                type: 'EXPENSE',
                description: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
            });
        } catch (error) {
            console.error('Error creating transaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Novo Lançamento</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Fechar modal"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Type Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => setType('INCOME')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${type === 'INCOME'
                                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                            }`}
                    >
                        <ArrowUpRight className="w-5 h-5" />
                        Receita
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('EXPENSE')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${type === 'EXPENSE'
                                ? 'bg-red-100 text-red-700 border-2 border-red-500'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                            }`}
                    >
                        <ArrowDownRight className="w-5 h-5" />
                        Despesa
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição *
                        </label>
                        <input
                            id="description"
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Ex: Honorários caso Silva"
                            required
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Valor *
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={formData.amount || ''}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="0,00"
                                required
                            />
                        </div>
                    </div>

                    {/* Date Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                {type === 'INCOME' ? 'Data Recebimento' : 'Data Pagamento'} *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Vencimento
                            </label>
                            <input
                                id="due_date"
                                type="date"
                                value={formData.due_date || ''}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Category & Account */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Categoria
                            </label>
                            <select
                                id="category"
                                value={formData.category_id || ''}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                                <option value="">Selecione...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">
                                Conta
                            </label>
                            <select
                                id="account"
                                value={formData.account_id || ''}
                                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                                <option value="">Selecione...</option>
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Observações
                        </label>
                        <textarea
                            id="notes"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                            rows={3}
                            placeholder="Adicione observações..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border rounded-xl hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2.5 rounded-xl font-medium text-white transition-all disabled:opacity-50 ${type === 'INCOME'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
