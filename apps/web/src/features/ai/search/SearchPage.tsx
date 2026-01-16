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
    setSelectedTribunals((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleType = (id: string) => {
    setSelectedTypes((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
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
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Busca Semântica Jurídica</h1>
          </div>
          <p className="mb-8 max-w-2xl text-indigo-100">
            Pesquise jurisprudência, legislação e documentos usando linguagem natural. Nossa IA
            encontra os resultados mais relevantes para sua pesquisa.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex: responsabilidade civil objetiva em acidentes de trânsito"
                  className="w-full rounded-xl border-0 py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-indigo-300"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-xl px-4 py-4 transition-colors ${
                  showFilters
                    ? 'bg-white text-indigo-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Filter className="h-5 w-5" />
                Filtros
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Buscar
                  </>
                )}
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 rounded-xl bg-white p-6 shadow-lg">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Document Types */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      Tipo de Documento
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DOCUMENT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => toggleType(type.id)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            selectedTypes.includes(type.id)
                              ? 'border-2 border-indigo-300 bg-indigo-100 text-indigo-700'
                              : 'border-2 border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <type.icon className="h-4 w-4" />
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      <Calendar className="mr-1 inline h-4 w-4" />
                      Período
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="flex-1 rounded-lg border px-3 py-2 text-sm text-gray-700"
                        aria-label="Data inicial"
                      />
                      <span className="self-center text-gray-400">até</span>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="flex-1 rounded-lg border px-3 py-2 text-sm text-gray-700"
                        aria-label="Data final"
                      />
                    </div>
                  </div>

                  {/* Tribunals */}
                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      <Building2 className="mr-1 inline h-4 w-4" />
                      Tribunais
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TRIBUNALS.map((tribunal) => (
                        <button
                          key={tribunal.id}
                          type="button"
                          onClick={() => toggleTribunal(tribunal.id)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                            selectedTribunals.includes(tribunal.id)
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
      <div className="mx-auto max-w-6xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {results && (
          <>
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {results.totalResults} resultado{results.totalResults !== 1 ? 's' : ''} encontrado
                  {results.totalResults !== 1 ? 's' : ''}
                </h2>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {results.searchTime}ms
                </span>
              </div>
              <button onClick={clearResults} className="text-sm text-gray-500 hover:text-gray-700">
                Limpar resultados
              </button>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {results.results.map((result) => (
                <div
                  key={result.id}
                  className="rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Result Header */}
                  <div
                    className="cursor-pointer p-4"
                    onClick={() =>
                      setExpandedResult(expandedResult === result.id ? null : result.id)
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${getSimilarityColor(result.similarity)}`}
                          >
                            {Math.round(result.similarity * 100)}% relevante
                          </span>
                          <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            {result.documentType === 'jurisprudence'
                              ? 'Jurisprudência'
                              : result.documentType === 'legislation'
                                ? 'Legislação'
                                : result.documentType === 'case'
                                  ? 'Processo'
                                  : 'Contrato'}
                          </span>
                          {result.metadata?.tribunal && (
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              {result.metadata.tribunal}
                            </span>
                          )}
                        </div>
                        <h3 className="mb-1 font-semibold text-gray-900">{result.title}</h3>
                        <p className="line-clamp-2 text-sm text-gray-600">
                          {result.content.substring(0, 200)}...
                        </p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        {expandedResult === result.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedResult === result.id && (
                    <div className="border-t px-4 pb-4">
                      <div className="pt-4">
                        {/* Metadata */}
                        {result.metadata && (
                          <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
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
                        <div className="mb-4 max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4">
                          <p className="whitespace-pre-wrap text-sm text-gray-700">
                            {result.content}
                          </p>
                        </div>

                        {/* Citation */}
                        {result.citation && (
                          <div className="rounded-lg bg-indigo-50 p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-medium text-indigo-700">
                                Citação (ABNT)
                              </span>
                              <button
                                onClick={() => copyCitation(result.citation!, result.id)}
                                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                {copiedId === result.id ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    Copiado!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4" />
                                    Copiar
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="font-mono text-sm text-indigo-900">{result.citation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {results.results.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-500">Tente refinar sua busca ou remover alguns filtros</p>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!results && !isSearching && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
              <Search className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Comece sua pesquisa</h3>
            <p className="mx-auto mb-8 max-w-md text-gray-500">
              Digite um tema jurídico e nossa IA encontrará os documentos mais relevantes usando
              busca semântica avançada.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setQuery('dano moral em relação de consumo')}
                className="rounded-full border bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                dano moral em relação de consumo
              </button>
              <button
                onClick={() => setQuery('prescrição quinquenal tributos')}
                className="rounded-full border bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                prescrição quinquenal tributos
              </button>
              <button
                onClick={() => setQuery('despejo por falta de pagamento')}
                className="rounded-full border bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
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
