'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
    X,
    Save,
    ArrowLeft
} from 'lucide-react';
import { clientsApi } from '@/lib/api/clients';
import toast from 'react-hot-toast';
import { ClientStatus, ClientType, ClientPriority } from '@/lib/types/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Schema de validação
const clientSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    phone: z.string().min(10, 'Telefone inválido').optional().or(z.literal('')),
    cpfCnpj: z.string().optional().or(z.literal('')),
    addressStreet: z.string().optional(),
    addressNumber: z.string().optional(),
    addressComplement: z.string().optional(),
    addressNeighborhood: z.string().optional(),
    addressCity: z.string().optional(),
    addressState: z.string().optional(),
    addressZipcode: z.string().optional(),
    source: z.string().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    status: z.nativeEnum(ClientStatus).default(ClientStatus.ACTIVE),
    type: z.nativeEnum(ClientType).default(ClientType.INDIVIDUAL),
    priority: z.nativeEnum(ClientPriority).default(ClientPriority.NORMAL),
});

type ClientFormData = z.infer<typeof clientSchema>;

const SOURCE_OPTIONS = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'website', label: 'Site' },
    { value: 'referral', label: 'Indicação' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'other', label: 'Outro' },
];

const COMMON_TAGS = [
    'VIP',
    'Urgente',
    'Recorrente',
    'Corporativo',
    'Pessoa Física',
    'Empresarial',
    'Trabalhista',
    'Família',
    'Criminal',
    'Cível',
];

interface ClientFormProps {
    clientId?: string;
}

export function ClientForm({ clientId }: ClientFormProps) {
    const router = useRouter();
    const isEditMode = !!clientId;
    const [loading, setLoading] = useState(false);

    // Form setup
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            cpfCnpj: '',
            status: ClientStatus.ACTIVE,
            type: ClientType.INDIVIDUAL,
            priority: ClientPriority.NORMAL,
            tags: [],
        },
    });

    const currentTags = watch('tags') || [];

    // Preencher form quando carregar dados
    useEffect(() => {
        const loadClient = async () => {
            if (isEditMode && clientId) {
                try {
                    setLoading(true);
                    const clientData = await clientsApi.getById(clientId);

                    // Map API data to form
                    reset({
                        name: clientData.name,
                        email: clientData.email || '',
                        phone: clientData.phone || '',
                        cpfCnpj: clientData.cpfCnpj || '',
                        addressStreet: clientData.addressStreet || '',
                        addressNumber: clientData.addressNumber || '',
                        addressComplement: clientData.addressComplement || '',
                        addressNeighborhood: clientData.addressNeighborhood || '',
                        addressCity: clientData.addressCity || '',
                        addressState: clientData.addressState || '',
                        addressZipcode: clientData.addressZipcode || '',
                        source: clientData.source || '',
                        tags: clientData.tags || [],
                        notes: clientData.notes || '',
                        status: clientData.status,
                        type: clientData.type,
                        priority: clientData.priority,
                    });
                } catch (error) {
                    toast.error('Erro ao carregar dados do cliente');
                } finally {
                    setLoading(false);
                }
            }
        };

        loadClient();
    }, [clientId, isEditMode, reset]);

    const onSubmit = async (data: ClientFormData) => {
        try {
            if (isEditMode && clientId) {
                await clientsApi.update(clientId, data);
                toast.success('Cliente atualizado com sucesso');
                router.push(`/dashboard/clients/${clientId}`);
            } else {
                await clientsApi.create(data);
                toast.success('Cliente criado com sucesso');
                router.push('/dashboard/clients');
            }
        } catch (error) {
            toast.error(isEditMode ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente');
            console.error(error);
        }
    };

    const addTag = (tag: string) => {
        if (!currentTags.includes(tag)) {
            setValue('tags', [...currentTags, tag]);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isEditMode
                            ? 'Atualize as informações do cliente'
                            : 'Preencha os dados do novo cliente'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Informações Básicas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nome */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo *</label>
                                <input
                                    {...register('name')}
                                    placeholder="Ex: João da Silva"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                                <input
                                    type="email"
                                    {...register('email')}
                                    placeholder="joao@exemplo.com"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                            </div>

                            {/* Telefone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone/WhatsApp</label>
                                <input
                                    {...register('phone')}
                                    placeholder="(11) 99999-9999"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                />
                                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                            </div>

                            {/* CPF/CNPJ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPF/CNPJ</label>
                                <input
                                    {...register('cpfCnpj')}
                                    placeholder="000.000.000-00"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                />
                            </div>

                            {/* Origem */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origem do Contato</label>
                                <select
                                    {...register('source')}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                >
                                    <option value="">Selecione...</option>
                                    {SOURCE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select
                                    {...register('status')}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                >
                                    {Object.values(ClientStatus).map((status) => (
                                        <option key={status} value={status}>
                                            {status === ClientStatus.ACTIVE ? 'Ativo' :
                                                status === ClientStatus.INACTIVE ? 'Inativo' :
                                                    status === ClientStatus.LEAD ? 'Lead' : 'Arquivado'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                <select
                                    {...register('type')}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                >
                                    {Object.values(ClientType).map((type) => (
                                        <option key={type} value={type}>
                                            {type === ClientType.INDIVIDUAL ? 'Pessoa Física' : 'Pessoa Jurídica'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Prioridade */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridade</label>
                                <select
                                    {...register('priority')}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                >
                                    {Object.values(ClientPriority).map((priority) => (
                                        <option key={priority} value={priority}>
                                            {priority === ClientPriority.LOW ? 'Baixa' :
                                                priority === ClientPriority.NORMAL ? 'Normal' :
                                                    priority === ClientPriority.HIGH ? 'Alta' : 'Urgente'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Endereço */}
                <Card>
                    <CardHeader>
                        <CardTitle>Endereço</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logradouro</label>
                            <input
                                {...register('addressStreet')}
                                placeholder="Rua, Avenida..."
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número</label>
                                <input
                                    {...register('addressNumber')}
                                    placeholder="123"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Complemento</label>
                                <input
                                    {...register('addressComplement')}
                                    placeholder="Apto 101, Bloco B"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bairro</label>
                                <input
                                    {...register('addressNeighborhood')}
                                    placeholder="Centro"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade</label>
                                <input
                                    {...register('addressCity')}
                                    placeholder="São Paulo"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                                <input
                                    {...register('addressState')}
                                    placeholder="SP"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CEP</label>
                                <input
                                    {...register('addressZipcode')}
                                    placeholder="00000-000"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tags e Notas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Classificação e Observações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {COMMON_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            if (currentTags.includes(tag)) {
                                                removeTag(tag);
                                            } else {
                                                addTag(tag);
                                            }
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${currentTags.includes(tag)
                                                ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                            <textarea
                                {...register('notes')}
                                placeholder="Adicione observações sobre o cliente..."
                                rows={5}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {isSubmitting
                            ? 'Salvando...'
                            : isEditMode
                                ? 'Atualizar Cliente'
                                : 'Criar Cliente'}
                    </button>
                </div>
            </form>
        </div>
    );
}
