'use client';

import { useState, useEffect } from 'react';
import { FileText, Upload, Download, Trash2, Eye, X } from 'lucide-react';
import { clientsApi } from '@/lib/api/clients';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { ClientDocument } from '@/lib/types/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ClientDocumentsProps {
  clientId: string;
}

export function ClientDocuments({ clientId }: ClientDocumentsProps) {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadDocuments();
    }
  }, [clientId]);

  const loadDocuments = async () => {
    try {
      const data = await clientsApi.getDocuments(clientId);
      setDocuments(data);
    } catch (error) {
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', documentName || selectedFile.name);

    try {
      await clientsApi.uploadDocument(clientId, formData);
      toast.success('Documento enviado com sucesso');
      setIsUploadOpen(false);
      setSelectedFile(null);
      setDocumentName('');
      loadDocuments();
    } catch (error) {
      toast.error('Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`Remover "${docName}"?`)) {
      return;
    }

    try {
      await clientsApi.deleteDocument(clientId, docId);
      toast.success('Documento removido com sucesso');
      loadDocuments();
    } catch (error) {
      toast.error('Erro ao remover documento');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação de tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB');
        return;
      }
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name);
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos
          </CardTitle>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Upload className="h-4 w-4" />
            Enviar Documento
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Modal de Upload Customizado */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Enviar Documento
                </h3>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  aria-label="Fechar modal"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Envie um documento para este cliente (máx. 10MB)
                </p>
                <div>
                  <label
                    htmlFor="document-name"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Nome do Documento
                  </label>
                  <input
                    id="document-name"
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Ex: Contrato de Honorários"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="document-file"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Arquivo
                  </label>
                  <input
                    id="document-file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                  />
                  {selectedFile && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 rounded-b-lg border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <button
                  onClick={() => {
                    setIsUploadOpen(false);
                    setSelectedFile(null);
                    setDocumentName('');
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Documentos */}
        {documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900 dark:text-white">{doc.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    className="rounded-md p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <a
                    href={doc.fileUrl}
                    download={doc.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md p-2 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
                    title="Baixar"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    className="rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <FileText className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <p>Nenhum documento enviado ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
