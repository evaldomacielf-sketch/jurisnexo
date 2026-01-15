'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconX } from '@tabler/icons-react';
import { useCreateTransaction } from '@/hooks/use-transactions';
import { useBankAccounts } from '@/hooks/use-bank-accounts';
import { useCategories } from '@/hooks/use-categories';
import { TransactionType, PaymentMethod } from '@/types/financial';

const transactionSchema = z.object({
    description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
    type: z.nativeEnum(TransactionType),
    amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
    category_id: z.string().uuid('Selecione uma categoria'),
    bank_account_id: z.string().uuid('Selecione uma conta'),
    transaction_date: z.string(),
    payment_method: z.nativeEnum(PaymentMethod),
    notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
    open: boolean;
    onClose: () => void;
}

export function TransactionModal({ open, onClose }: TransactionModalProps) {
    const createMutation = useCreateTransaction();
    const { data: bankAccounts } = useBankAccounts();
    const { data: categories } = useCategories();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            transaction_date: new Date().toISOString().split('T')[0],
            type: TransactionType.INCOME,
            payment_method: PaymentMethod.PIX,
        },
    });

    const transactionType = watch('type');

    const onSubmit = async (data: TransactionFormData) => {
        try {
            await createMutation.mutateAsync(data);
            reset();
            onClose();
        } catch (error) {
            console.error('Erro ao criar transação:', error);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">Nova Transação</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <IconX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Transação
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="relative flex cursor-pointer">
                                <input
                                    type="radio"
                                    value={TransactionType.INCOME}
                                    {...register('type')}
                                    className="peer sr-only"
                                />
                                <div className="w-full px-4 py-3 border-2 rounded-lg peer-checked:border-success peer-checked:bg-success-light transition-all">
                                    <span className="font-medium">Receita</span>
                                </div>
                            </label>
                            <label className="relative flex cursor-pointer">
                                <input
                                    type="radio"
                                    value={TransactionType.EXPENSE}
                                    {...register('type')}
                                    className="peer sr-only"
                                />
                                <div className="w-full px-4 py-3 border-2 rounded-lg peer-checked:border-error peer-checked:bg-error-light transition-all">
                                    <span className="font-medium">Despesa</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição *
                        </label>
                        <input
                            {...register('description')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Ex: Honorários advocatícios - Cliente XYZ"
                        />
                        {errors.description && (
                            <p className="text-sm text-error mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('amount', { valueAsNumber: true })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="0,00"
                        />
                        {errors.amount && (
                            <p className="text-sm text-error mt-1">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoria *
                        </label>
                        <select
                            {...register('category_id')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Selecione uma categoria</option>
                            {categories
                                ?.filter(
                                    (cat) => cat.type === transactionType || cat.type === 'BOTH'
                                )
                                .map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                        </select>
                        {errors.category_id && (
                            <p className="text-sm text-error mt-1">{errors.category_id.message}</p>
                        )}
                    </div>

                    {/* Bank Account */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Conta Bancária *
                        </label>
                        <select
                            {...register('bank_account_id')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Selecione uma conta</option>
                            {bankAccounts?.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name} - {account.bank_name}
                                </option>
                            ))}
                        </select>
                        {errors.bank_account_id && (
                            <p className="text-sm text-error mt-1">{errors.bank_account_id.message}</p>
                        )}
                    </div>

                    {/* Date and Payment Method */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data *
                            </label>
                            <input
                                type="date"
                                {...register('transaction_date')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Método de Pagamento *
                            </label>
                            <select
                                {...register('payment_method')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value={PaymentMethod.PIX}>PIX</option>
                                <option value={PaymentMethod.BANK_TRANSFER}>Transferência</option>
                                <option value={PaymentMethod.CREDIT_CARD}>Cartão de Crédito</option>
                                <option value={PaymentMethod.DEBIT_CARD}>Cartão de Débito</option>
                                <option value={PaymentMethod.CASH}>Dinheiro</option>
                                <option value={PaymentMethod.CHECK}>Cheque</option>
                                <option value={PaymentMethod.OTHER}>Outro</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações
                        </label>
                        <textarea
                            {...register('notes')}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Informações adicionais..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-outline"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="btn-primary"
                        >
                            {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
