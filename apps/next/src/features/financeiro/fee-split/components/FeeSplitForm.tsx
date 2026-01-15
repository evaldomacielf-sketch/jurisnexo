import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@/components/shared/FormField';
import { useCreateRegraFeeSplit, useUpdateRegraFeeSplit } from '../hooks/useFeeSplit';
import { Plus, Trash } from 'lucide-react';
import { RegraFeeSplit } from '@/types/financeiro.types';

const advogadoSchema = z.object({
    advogado_id: z.string().min(1, 'Advogado é obrigatório'),
    percentual: z.number().min(0).max(100).optional(),
    valor_fixo: z.number().min(0).optional(),
});

const schema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    tipo_divisao: z.enum(['percentual', 'fixo', 'progressivo']),
    status: z.enum(['ativa', 'inativa']),
    aplicacao_automatica: z.boolean(),
    advogados: z.array(advogadoSchema).min(1, 'Adicione pelo menos um advogado'),
});

type FormData = z.infer<typeof schema>;

interface FeeSplitFormProps {
    regra?: RegraFeeSplit;
    onSuccess: () => void;
}

export const FeeSplitForm: React.FC<FeeSplitFormProps> = ({ regra, onSuccess }) => {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: regra ? {
            ...regra,
            // Ensure advogados is mapped correctly if types mismatch, 
            // strictly adhering to schema structure.
            advogados: regra.advogados?.map(a => ({
                advogado_id: a.advogado_id,
                percentual: a.percentual ? Number(a.percentual) : undefined,
                valor_fixo: a.valor_fixo ? Number(a.valor_fixo) : undefined
            }))
        } : {
            advogados: [{ advogado_id: '', percentual: 0 }],
            tipo_divisao: 'percentual',
            status: 'ativa',
            aplicacao_automatica: false
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'advogados',
    });

    const createMutation = useCreateRegraFeeSplit();
    const updateMutation = useUpdateRegraFeeSplit();

    const tipoDivisao = watch('tipo_divisao');

    const onSubmit = (data: FormData) => {
        if (regra) {
            updateMutation.mutate({ id: regra.id, data }, { onSuccess });
        } else {
            createMutation.mutate(data, { onSuccess });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                label="Nome da Regra"
                name="nome"
                register={register}
                errors={errors}
                required
                placeholder="Ex: Divisão Padrão 50/50"
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    label="Tipo de Divisão"
                    name="tipo_divisao"
                    type="select"
                    register={register}
                    errors={errors}
                    required
                    options={[
                        { value: 'percentual', label: 'Percentual' },
                        { value: 'fixo', label: 'Valor Fixo' },
                        { value: 'progressivo', label: 'Progressivo' },
                    ]}
                />
                <FormField
                    label="Status"
                    name="status"
                    type="select"
                    register={register}
                    errors={errors}
                    required
                    options={[
                        { value: 'ativa', label: 'Ativa' },
                        { value: 'inativa', label: 'Inativa' },
                    ]}
                />
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="aplicacao_automatica"
                    {...register('aplicacao_automatica')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="aplicacao_automatica" className="ml-2 block text-sm text-gray-900">
                    Aplicar automaticamente em novos honorários
                </label>
            </div>

            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold">Advogados</h4>
                    <button
                        type="button"
                        onClick={() => append({ advogado_id: '', percentual: 0 })}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar Advogado
                    </button>
                </div>

                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-4 mb-4 items-end">
                        <div className="col-span-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Advogado {index + 1}
                            </label>
                            <select
                                {...register(`advogados.${index}.advogado_id` as const)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Selecione um advogado</option>
                                {/* 
                   TODO: Fetch actual lawyers list. 
                   For now, hardcoded as per user snippet.
                */}
                                <option value="adv1">Dr. João Silva</option>
                                <option value="adv2">Dra. Maria Santos</option>
                            </select>
                        </div>

                        {tipoDivisao === 'percentual' && (
                            <div className="col-span-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Percentual (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register(`advogados.${index}.percentual` as const, {
                                        valueAsNumber: true,
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        )}

                        {tipoDivisao === 'fixo' && (
                            <div className="col-span-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valor Fixo (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register(`advogados.${index}.valor_fixo` as const, {
                                        valueAsNumber: true,
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        )}

                        <div className="col-span-1">
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 text-red-600 hover:text-red-800"
                                disabled={fields.length === 1}
                                aria-label="Remover advogado"
                            >
                                <Trash className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
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
                    {regra ? 'Atualizar' : 'Criar'}
                </button>
            </div>
        </form>
    );
};
