import React, { useState } from 'react';
import { Card } from '@/components/shared/Card';
import { Table } from '@/components/shared/Table';
import { Modal } from '@/components/shared/Modal';
import { useHonorarios, useDeleteHonorario } from '../hooks/useHonorarios';
import { HonorarioForm } from '../components/HonorarioForm';
import { HonorarioStats } from '../components/HonorarioStats';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Honorario } from '@/types/financeiro.types';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export const HonorariosPage: React.FC = () => {
    const [filters, setFilters] = useState({
        status_pagamento: '',
        cliente_id: '',
        data_inicio: '',
        data_fim: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHonorario, setSelectedHonorario] = useState<Honorario | null>(null);

    const { data: honorarios, isLoading } = useHonorarios(filters);
    const deleteMutation = useDeleteHonorario();

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este honorário?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = [
        {
            key: 'cliente_nome',
            header: 'Cliente',
            render: (item: Honorario) => item.cliente?.nome || '-',
        },
        {
            key: 'tipo',
            header: 'Tipo',
            render: (item: Honorario) => {
                const tipos: Record<string, string> = {
                    fixo: 'Fixo',
                    hora: 'Por Hora',
                    exito: 'Êxito',
                    hibrido: 'Híbrido',
                };
                return tipos[item.tipo] || item.tipo;
            },
        },
        {
            key: 'valor_total',
            header: 'Valor Total',
            render: (item: Honorario) => `R$ ${Number(item.valor_total).toFixed(2)}`,
        },
        {
            key: 'valor_pago',
            header: 'Pago',
            render: (item: Honorario) => `R$ ${Number(item.valor_pago).toFixed(2)}`,
        },
        {
            key: 'valor_pendente',
            header: 'Pendente',
            render: (item: Honorario) => `R$ ${Number(item.valor_pendente).toFixed(2)}`,
        },
        {
            key: 'status_pagamento',
            header: 'Status',
            render: (item: Honorario) => {
                const statusColors: Record<string, string> = {
                    pendente: 'bg-yellow-100 text-yellow-800',
                    parcial: 'bg-blue-100 text-blue-800',
                    pago: 'bg-green-100 text-green-800',
                    atrasado: 'bg-red-100 text-red-800',
                };
                const statusLabels: Record<string, string> = {
                    pendente: 'Pendente',
                    parcial: 'Parcial',
                    pago: 'Pago',
                    atrasado: 'Atrasado',
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status_pagamento || 'pendente']}`}>
                        {statusLabels[item.status_pagamento || 'pendente']}
                    </span>
                );
            },
        },
        {
            key: 'data_vencimento',
            header: 'Vencimento',
            render: (item: Honorario) =>
                item.data_vencimento
                    ? format(new Date(item.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })
                    : '-',
        },
        {
            key: 'actions',
            header: 'Ações',
            render: (item: Honorario) => (
                <div className="flex gap-2 items-center">
                    <Link href={`/financeiro/honorarios/${item.id}`} className="text-gray-600 hover:text-gray-800">
                        <Eye className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => {
                            setSelectedHonorario(item);
                            setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                    >
                        Excluir
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <HonorarioStats filters={filters} />

            <Card
                title="Gestão de Honorários"
                subtitle="Gerencie os honorários vinculados a processos e clientes"
                className="mt-6"
                actions={
                    <button
                        onClick={() => {
                            setSelectedHonorario(null);
                            setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Novo Honorário
                    </button>
                }
            >
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <select
                        value={filters.status_pagamento}
                        onChange={(e) => setFilters({ ...filters, status_pagamento: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Filtrar por status"
                    >
                        <option value="">Todos os status</option>
                        <option value="pendente">Pendente</option>
                        <option value="parcial">Parcial</option>
                        <option value="pago">Pago</option>
                        <option value="atrasado">Atrasado</option>
                    </select>
                    <input
                        type="date"
                        value={filters.data_inicio}
                        onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Data início"
                    />
                    <input
                        type="date"
                        value={filters.data_fim}
                        onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Data fim"
                    />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <Table data={honorarios?.items || []} columns={columns} isLoading={isLoading} />
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedHonorario(null);
                }}
                title={selectedHonorario ? 'Editar Honorário' : 'Novo Honorário'}
                size="lg"
            >
                <HonorarioForm
                    honorario={selectedHonorario}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedHonorario(null);
                    }}
                />
            </Modal>
        </div>
    );
};
