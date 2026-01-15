import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@/components/shared/FormField';
import { useCreateLivroCaixaEntry, useUpdateLivroCaixaEntry } from '../hooks/useLivroCaixa';
import { LivroCaixaEntry } from '@/types/financeiro.types';
import { Button } from '@/components/ui/button'; // Assuming shadcn button exists or use standard button

const schema = z.object({
    tipo: z.enum(['receita', 'despesa']),
    categoria: z.string().min(1, 'Categoria é obrigatória'),
    descricao: z.string().min(1, 'Descrição é obrigatória'),
    valor: z.number().positive('Valor deve ser positivo'),
    data_lancamento: z.string().min(1, 'Data é obrigatória'),
    forma_pagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
    dedutivel_ir: z.boolean(),
    observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface LivroCaixaFormProps {
    entry?: LivroCaixaEntry; // Use strict type
    onSuccess: () => void;
}

export const LivroCaixaForm: React.FC<LivroCaixaFormProps> = ({ entry, onSuccess }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: entry ? {
            ...entry,
            data_lancamento: entry.data_lancamento ? new Date(entry.data_lancamento).toISOString().split('T')[0] : '',
            valor: Number(entry.valor) // Ensure number
        } : {
            dedutivel_ir: false,
            tipo: 'receita'
        },
    });

    const createMutation = useCreateLivroCaixaEntry();
    const updateMutation = useUpdateLivroCaixaEntry();

    const onSubmit = (data: FormData) => {
        if (entry) {
            updateMutation.mutate({ id: entry.id, data }, { onSuccess });
        } else {
            createMutation.mutate(data, { onSuccess });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    label="Tipo"
                    name="tipo"
                    type="select"
                    register={register}
                    errors={errors}
                    required
                    options={[
                        { value: 'receita', label: 'Receita' },
                        { value: 'despesa', label: 'Despesa' },
                    ]}
                />
                <FormField
                    label="Categoria"
                    name="categoria"
                    register={register}
                    errors={errors}
                    required
                />
            </div>

            <FormField
                label="Descrição"
                name="descricao"
                register={register}
                errors={errors}
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    label="Valor"
                    name="valor"
                    type="number"
                    register={register}
                    errors={errors}
                    required
                />
                <FormField
                    label="Data do Lançamento"
                    name="data_lancamento"
                    type="date"
                    register={register}
                    errors={errors}
                    required
                />
            </div>

            <FormField
                label="Forma de Pagamento"
                name="forma_pagamento"
                type="select"
                register={register}
                errors={errors}
                required
                options={[
                    { value: 'dinheiro', label: 'Dinheiro' },
                    { value: 'pix', label: 'PIX' },
                    { value: 'cartao_credito', label: 'Cartão de Crédito' },
                    { value: 'transferencia', label: 'Transferência' },
                    { value: 'boleto', label: 'Boleto' },
                ]}
            />

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="dedutivel_ir"
                    {...register('dedutivel_ir')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="dedutivel_ir" className="ml-2 block text-sm text-gray-900">
                    Dedutível do Imposto de Renda
                </label>
            </div>

            <FormField
                label="Observações"
                name="observacoes"
                type="textarea"
                register={register}
                errors={errors}
            />

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onSuccess}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {entry ? 'Atualizar' : 'Criar'}
                </button>
            </div>
        </form>
    );
};
