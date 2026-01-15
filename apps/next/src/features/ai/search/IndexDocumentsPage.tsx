'use client';

import { useState, useCallback } from 'react';
import {
    Upload,
    FileText,
    Check,
    AlertCircle,
    Loader2,
    Trash2,
    Database,
    File,
    Scale,
    BookOpen,
} from 'lucide-react';
import { aiApi } from '@/services/api/ai.service';

const DOCUMENT_TYPES = [
    { id: 'jurisprudence', name: 'Jurisprudência', icon: Scale, description: 'Acórdãos, decisões e sentenças' },
    { id: 'legislation', name: 'Legislação', icon: BookOpen, description: 'Leis, decretos, portarias' },
    { id: 'case', name: 'Processos', icon: FileText, description: 'Petições, recursos, documentos processuais' },
    { id: 'contract', name: 'Contratos', icon: File, description: 'Contratos e minutas' },
];

interface IndexedDocument {
    id: string;
    name: string;
    type: string;
    chunks: number;
    indexedAt: Date;
}

export default function IndexDocumentsPage() {
    const [documentType, setDocumentType] = useState('jurisprudence');
    const [content, setContent] = useState('');
    const [metadata, setMetadata] = useState({
        titulo: '',
        numero: '',
        tribunal: '',
        relator: '',
        date: '',
    });
    const [isIndexing, setIsIndexing] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; chunks?: number } | null>(null);
    const [recentDocuments, setRecentDocuments] = useState<IndexedDocument[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsIndexing(true);
        setResult(null);

        try {
            const response = await aiApi.indexDocument(
                content,
                documentType,
                {
                    ...metadata,
                    tipo: documentType,
                },
            );

            setResult({
                success: true,
                message: `Documento indexado com sucesso!`,
                chunks: response.chunksCreated,
            });

            // Add to recent
            setRecentDocuments(prev => [
                {
                    id: Date.now().toString(),
                    name: metadata.titulo || 'Documento sem título',
                    type: documentType,
                    chunks: response.chunksCreated,
                    indexedAt: new Date(),
                },
                ...prev.slice(0, 9),
            ]);

            // Clear form
            setContent('');
            setMetadata({ titulo: '', numero: '', tribunal: '', relator: '', date: '' });
        } catch (err: any) {
            setResult({
                success: false,
                message: err.message || 'Erro ao indexar documento',
            });
        } finally {
            setIsIndexing(false);
        }
    };

    const handleFileUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        // Read file content
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setContent(text);
            setMetadata(prev => ({
                ...prev,
                titulo: file.name.replace(/\.[^/.]+$/, ''),
            }));
        };
        reader.readAsText(file);
    }, []);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFileUpload(e.dataTransfer.files);
    }, [handleFileUpload]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Database className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Indexar Documentos</h1>
                    </div>
                    <p className="text-gray-500">
                        Adicione documentos à base de busca semântica para pesquisa com IA
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-6">
                            {/* Document Type */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Tipo de Documento
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {DOCUMENT_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setDocumentType(type.id)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${documentType === type.id
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <type.icon className={`w-5 h-5 mb-2 ${documentType === type.id ? 'text-indigo-600' : 'text-gray-400'
                                                }`} />
                                            <p className="font-medium text-gray-900">{type.name}</p>
                                            <p className="text-xs text-gray-500">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Título
                                    </label>
                                    <input
                                        type="text"
                                        value={metadata.titulo}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, titulo: e.target.value }))}
                                        placeholder="Ex: REsp 1234567"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número
                                    </label>
                                    <input
                                        type="text"
                                        value={metadata.numero}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, numero: e.target.value }))}
                                        placeholder="Ex: 1234567-89.2020.8.26.0100"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tribunal
                                    </label>
                                    <input
                                        type="text"
                                        value={metadata.tribunal}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, tribunal: e.target.value }))}
                                        placeholder="Ex: STJ, TJSP"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data
                                    </label>
                                    <input
                                        type="date"
                                        value={metadata.date}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        aria-label="Data do documento"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Conteúdo do Documento
                                </label>

                                {/* Drag & Drop Zone */}
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-xl p-4 mb-3 text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                                        }`}
                                >
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">
                                        Arraste um arquivo ou{' '}
                                        <label className="text-indigo-600 cursor-pointer hover:underline">
                                            clique para selecionar
                                            <input
                                                type="file"
                                                accept=".txt,.md,.doc,.docx"
                                                onChange={(e) => handleFileUpload(e.target.files)}
                                                className="hidden"
                                            />
                                        </label>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">TXT, MD, DOC (max 10MB)</p>
                                </div>

                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Cole o texto do documento aqui ou faça upload de um arquivo..."
                                    rows={12}
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {content.length} caracteres • ~{Math.ceil(content.length / 3)} tokens estimados
                                </p>
                            </div>

                            {/* Result Message */}
                            {result && (
                                <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                    }`}>
                                    {result.success ? (
                                        <Check className="w-5 h-5 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 mt-0.5" />
                                    )}
                                    <div>
                                        <p className="font-medium">{result.message}</p>
                                        {result.chunks && (
                                            <p className="text-sm opacity-80">
                                                {result.chunks} chunks criados para busca semântica
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isIndexing || !content.trim()}
                                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {isIndexing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Indexando...
                                    </>
                                ) : (
                                    <>
                                        <Database className="w-5 h-5" />
                                        Indexar Documento
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Recent Documents */}
                    <div>
                        <div className="bg-white rounded-xl border shadow-sm p-4">
                            <h3 className="font-medium text-gray-900 mb-4">Documentos Recentes</h3>
                            {recentDocuments.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">
                                    Nenhum documento indexado ainda
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {recentDocuments.map((doc) => (
                                        <li key={doc.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {doc.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {doc.chunks} chunks • {doc.type}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Help */}
                        <div className="mt-4 bg-indigo-50 rounded-xl p-4">
                            <h4 className="font-medium text-indigo-900 mb-2">💡 Dicas</h4>
                            <ul className="text-sm text-indigo-700 space-y-1">
                                <li>• Documentos longos são automaticamente divididos</li>
                                <li>• Preencha os metadados para filtros na busca</li>
                                <li>• Formatos PDF requerem extração prévia</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
