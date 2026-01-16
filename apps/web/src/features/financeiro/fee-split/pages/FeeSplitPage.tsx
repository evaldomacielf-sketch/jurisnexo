import React, { useState } from 'react';
import { Card } from '@/components/shared/Card';
import { Table } from '@/components/shared/Table';
import { Modal } from '@/components/shared/Modal';
import { useRegrasFeeSplit, useDeleteRegraFeeSplit } from '../hooks/useFeeSplit';
import { FeeSplitForm } from '../components/FeeSplitForm';
import { RegraFeeSplit } from '@/types/financeiro.types';

export const FeeSplitPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRegra, setSelectedRegra] = useState<RegraFeeSplit | null>(null);

    const { data: regras, isLoading } = useRegrasFeeSplit();
    const deleteMutation = useDeleteRegraFeeSplit();

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta regra?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = [
        { key: 'nome', header: 'Nome da Regra' },
        {
            key: 'tipo_divisao',
            header: 'Tipo',
            render: (item: RegraFeeSplit) => {
                const tipos: Record<string, string> = {
                    percentual: 'Percentual',
                    fixo: 'Valor Fixo',
                    progressivo: 'Progressivo',
                };
                return tipos[item.tipo_divisao] || item.tipo_divisao;
            },
        },
        {
            key: 'advogados',
            header: 'Advogados',
            render: (item: RegraFeeSplit) => item.advogados?.length || 0,
        },
        {
            key: 'status',
            header: 'Status',
            render: (item: RegraFeeSplit) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {item.status === 'ativa' ? 'Ativa' : 'Inativa'}
                </span>
            ),
        },
        {
            key: 'aplicacao_automatica',
            header: 'Aplicação Automática',
            render: (item: RegraFeeSplit) => (item.aplicacao_automatica ? 'Sim' : 'Não'),
        },
        {
            key: 'actions',
            header: 'Ações',
            render: (item: RegraFeeSplit) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setSelectedRegra(item);
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
            <Card
                title="Divisão de Honorários (Fee Split)"
                subtitle="Configure regras automáticas de divisão de honorários entre advogados"
                actions={
                    <button
                        onClick={() => {
                            setSelectedRegra(null);
                            setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Nova Regra
                    </button>
                }
            >
                <Table data={regras || []} columns={columns} isLoading={isLoading} />
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedRegra(null);
                }}
                title={selectedRegra ? 'Editar Regra' : 'Nova Regra de Divisão'}
                size="lg"
            >
                <FeeSplitForm
                    regra={selectedRegra || undefined}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedRegra(null);
                    }}
                />
            </Modal>
        </div>
    );
};
