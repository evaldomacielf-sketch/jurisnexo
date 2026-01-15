'use client';

import { useState } from 'react';
import {
    Search,
    Filter,
    FileText,
    Calendar,
    Building2,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Loader2,
    Scale,
    BookOpen,
    ExternalLink,
    Clock,
    Sparkles,
} from 'lucide-react';
import { useSemanticSearch } from '../hooks/useAi';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TRIBUNALS = [
    { id: 'STF', name: 'Supremo Tribunal Federal', icon: Scale },
    { id: 'STJ', name: 'Superior Tribunal de Justiça', icon: Scale },
    { id: 'TRF1', name: 'TRF 1ª Região', icon: Building2 },
    { id: 'TRF2', name: 'TRF 2ª Região', icon: Building2 },
    { id: 'TRF3', name: 'TRF 3ª Região', icon: Building2 },
    { id: 'TRF4', name: 'TRF 4ª Região', icon: Building2 },
    { id: 'TRF5', name: 'TRF 5ª Região', icon: Building2 },
    { id: 'TJSP', name: 'TJ São Paulo', icon: Building2 },
    { id: 'TJRJ', name: 'TJ Rio de Janeiro', icon: Building2 },
    { id: 'TJMG', name: 'TJ Minas Gerais', icon: Building2 },
];

const DOCUMENT_TYPES = [
    { id: 'jurisprudence', name: 'Jurisprudência', icon: Scale },
    { id: 'legislation', name: 'Legislação', icon: BookOpen },
    { id: 'case', name: 'Processos', icon: FileText },
    { id: 'contract', name: 'Contratos', icon: FileText },
];

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTribunals, setSelectedTribunals] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['jurisprudence']);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [expandedResult, setExpandedResult] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const { results, isSearching, error, search, clearResults } = useSemanticSearch();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        await search({
            query,
            documentTypes: selectedTypes as any[],
            tribunals: selectedTribunals,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            limit: 20,
        });
    };

    const toggleTribunal = (id: string) => {
        setSelectedTribunals(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const toggleType = (id: string) => {
        setSelectedTypes(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const copyCitation = async (citation: string, id: string) => {
        await navigator.clipboard.writeText(citation);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getSimilarityColor = (similarity: number) => {
        if (similarity >= 0.8) return 'bg-green-100 text-green-700';
        if (similarity >= 0.6) return 'bg-yellow-100 text-yellow-700';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold">Busca Semântica Jurídica</h1>
                    </div>
                    <p className="text-indigo-100 mb-8 max-w-2xl">
                        Pesquise jurisprudência, legislação e documentos usando linguagem natural.
                        Nossa IA encontra os resultados mais relevantes para sua pesquisa.
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch}>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Ex: responsabilidade civil objetiva em acidentes de trânsito"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-indigo-300 border-0"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-4 rounded-xl flex items-center gap-2 transition-colors ${showFilters ? 'bg-white text-indigo-600' : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                            >
                                <Filter className="w-5 h-5" />
                                Filtros
                                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button
                                type="submit"
                                disabled={isSearching || !query.trim()}
                                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isSearching ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Buscando...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Buscar
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <div className="mt-4 p-6 bg-white rounded-xl shadow-lg">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Document Types */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Tipo de Documento
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {DOCUMENT_TYPES.map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => toggleType(type.id)}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${selectedTypes.includes(type.id)
                                                            ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                                                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <type.icon className="w-4 h-4" />
                                                    {type.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Período
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                className="flex-1 px-3 py-2 border rounded-lg text-gray-700 text-sm"
                                                aria-label="Data inicial"
                                            />
                                            <span className="text-gray-400 self-center">até</span>
                                            <input
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                className="flex-1 px-3 py-2 border rounded-lg text-gray-700 text-sm"
                                                aria-label="Data final"
                                            />
                                        </div>
                                    </div>

                                    {/* Tribunals */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            <Building2 className="w-4 h-4 inline mr-1" />
                                            Tribunais
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {TRIBUNALS.map((tribunal) => (
                                                <button
                                                    key={tribunal.id}
                                                    type="button"
                                                    onClick={() => toggleTribunal(tribunal.id)}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTribunals.includes(tribunal.id)
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {tribunal.id}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
                        {error}
                    </div>
                )}

                {results && (
                    <>
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {results.totalResults} resultado{results.totalResults !== 1 ? 's' : ''} encontrado{results.totalResults !== 1 ? 's' : ''}
                                </h2>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {results.searchTime}ms
                                </span>
                            </div>
                            <button
                                onClick={clearResults}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Limpar resultados
                            </button>
                        </div>

                        {/* Results List */}
                        <div className="space-y-4">
                            {results.results.map((result) => (
                                <div
                                    key={result.id}
                                    className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Result Header */}
                                    <div
                                        className="p-4 cursor-pointer"
                                        onClick={() => setExpandedResult(expandedResult === result.id ? null : result.id)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSimilarityColor(result.similarity)}`}>
                                                        {Math.round(result.similarity * 100)}% relevante
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                                        {result.documentType === 'jurisprudence' ? 'Jurisprudência' :
                                                            result.documentType === 'legislation' ? 'Legislação' :
                                                                result.documentType === 'case' ? 'Processo' : 'Contrato'}
                                                    </span>
                                                    {result.metadata?.tribunal && (
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                                            {result.metadata.tribunal}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {result.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {result.content.substring(0, 200)}...
                                                </p>
                                            </div>
                                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                                {expandedResult === result.id ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedResult === result.id && (
                                        <div className="px-4 pb-4 border-t">
                                            <div className="pt-4">
                                                {/* Metadata */}
                                                {result.metadata && (
                                                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                                                        {result.metadata.numero && (
                                                            <span>
                                                                <strong>Número:</strong> {result.metadata.numero}
                                                            </span>
                                                        )}
                                                        {result.metadata.relator && (
                                                            <span>
                                                                <strong>Relator:</strong> {result.metadata.relator}
                                                            </span>
                                                        )}
                                                        {result.metadata.date && (
                                                            <span>
                                                                <strong>Data:</strong> {result.metadata.date}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Full Content */}
                                                <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                        {result.content}
                                                    </p>
                                                </div>

                                                {/* Citation */}
                                                {result.citation && (
                                                    <div className="bg-indigo-50 rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-indigo-700">
                                                                Citação (ABNT)
                                                            </span>
                                                            <button
                                                                onClick={() => copyCitation(result.citation!, result.id)}
                                                                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                {copiedId === result.id ? (
                                                                    <>
                                                                        <Check className="w-4 h-4" />
                                                                        Copiado!
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="w-4 h-4" />
                                                                        Copiar
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-indigo-900 font-mono">
                                                            {result.citation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {results.results.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Nenhum resultado encontrado
                                </h3>
                                <p className="text-gray-500">
                                    Tente refinar sua busca ou remover alguns filtros
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!results && !isSearching && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Comece sua pesquisa
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Digite um tema jurídico e nossa IA encontrará os documentos mais relevantes
                            usando busca semântica avançada.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() => setQuery('dano moral em relação de consumo')}
                                className="px-4 py-2 bg-white border rounded-full text-sm text-gray-600 hover:bg-gray-50"
                            >
                                dano moral em relação de consumo
                            </button>
                            <button
                                onClick={() => setQuery('prescrição quinquenal tributos')}
                                className="px-4 py-2 bg-white border rounded-full text-sm text-gray-600 hover:bg-gray-50"
                            >
                                prescrição quinquenal tributos
                            </button>
                            <button
                                onClick={() => setQuery('despejo por falta de pagamento')}
                                className="px-4 py-2 bg-white border rounded-full text-sm text-gray-600 hover:bg-gray-50"
                            >
                                despejo por falta de pagamento
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
