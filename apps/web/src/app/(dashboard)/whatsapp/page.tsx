'use client';

import { Header } from '@/components/dashboard/Header';
import { MessageSquare, QrCode, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { whatsappApi } from '@/services/api/whatsapp.service';

export default function WhatsAppPage() {
  const { data: status, isLoading } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: () => whatsappApi.getStatus(),
    refetchInterval: 5000,
  });

  const isConnected = status?.isConnected ?? false;

  return (
    <>
      <Header showSearch={false} />

      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">WhatsApp Business</h1>
          <p className="text-gray-600 dark:text-gray-400">Conecte e gerencie suas conversas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                <MessageSquare className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Status da Conexão</h3>
                <div className="flex items-center gap-2 mt-1">
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 text-gray-400 animate-spin" /><span className="text-sm text-gray-500">Verificando...</span></>
                  ) : isConnected ? (
                    <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-sm text-green-600">Conectado</span></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-red-500" /><span className="text-sm text-red-600">Não conectado</span></>
                  )}
                </div>
              </div>
            </div>
            {!isConnected && <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">Conectar</button>}
          </div>
        </div>

        {!isConnected && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Conecte seu WhatsApp</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Escaneie o QR Code para começar</p>
            <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
              <p className="text-gray-500">QR Code aparecerá aqui</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
