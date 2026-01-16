import React, { useState } from 'react';
import { Card } from '@/components/shared/Card';
import { Table } from '@/components/shared/Table';
import { Modal } from '@/components/shared/Modal';
import { useLivroCaixa, useExportarLivroCaixa, useDeleteLivroCaixaEntry } from '../hooks/useLivroCaixa';
import { LivroCaixaForm } from '../components/LivroCaixaForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LivroCaixaEntry } from '@/types/financeiro.types';

export const LivroCaixaPage: React.FC = () => {
    const [filters, setFilters] = useState({
        data_inicio: '',
        data_fim: '',
        tipo: '',
        categoria: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<LivroCaixaEntry | null>(null);

    const { data: entries, isLoading } = useLivroCaixa(filters);
    const exportMutation = useExportarLivroCaixa();
    const deleteMutation = useDeleteLivroCaixaEntry();

    const handleExport = (formato: 'pdf' | 'excel') => {
        exportMutation.mutate({ formato, filters });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = [
        {
            key: 'data_lancamento',
            header: 'Data',
            render: (item: LivroCaixaEntry) => format(new Date(item.data_lancamento), 'dd/MM/yyyy', { locale: ptBR }),
        },
        {
            key: 'tipo',
            header: 'Tipo',
            render: (item: LivroCaixaEntry) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${item.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                >
                    {item.tipo === 'receita' ? 'Receita' : 'Despesa'}
                </span>
            ),
        },
        { key: 'categoria', header: 'Categoria' },
        { key: 'descricao', header: 'Descrição' },
        {
            key: 'valor',
            header: 'Valor',
            render: (item: LivroCaixaEntry) => `R$ ${Number(item.valor).toFixed(2)}`,
        },
        {
            key: 'dedutivel_ir',
            header: 'Dedutível IR',
            render: (item: LivroCaixaEntry) => (item.dedutivel_ir ? 'Sim' : 'Não'),
        },
        {
            key: 'actions',
            header: 'Ações',
            render: (item: LivroCaixaEntry) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setSelectedEntry(item);
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
                title="Livro Caixa Digital"
                subtitle="Gerencie todas as receitas e despesas do escritório"
                actions={
                    <>
                        <button
                            onClick={() => handleExport('excel')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Exportar Excel
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Exportar PDF
                        </button>
                        <button
                            onClick={() => {
                                setSelectedEntry(null);
                                setIsModalOpen(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Novo Lançamento
                        </button>
                    </>
                }
            >
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                    <select
                        value={filters.tipo}
                        onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Filtrar por tipo"
                    >
                        <option value="">Todos os tipos</option>
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                    </select>
                    <input
                        type="text"
                        value={filters.categoria}
                        onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Categoria"
                    />
                </div>

                <Table data={entries?.items || []} columns={columns} isLoading={isLoading} />
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedEntry(null);
                }}
                title={selectedEntry ? 'Editar Lançamento' : 'Novo Lançamento'}
                size="lg"
            >
                <LivroCaixaForm
                    entry={selectedEntry || undefined}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedEntry(null);
                    }}
                />
            </Modal>
        </div>
    );
};
