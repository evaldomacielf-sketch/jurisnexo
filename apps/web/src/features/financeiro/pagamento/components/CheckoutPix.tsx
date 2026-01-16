import React from 'react';
import { Card } from '@/components/shared/Card';
import { QrCode, Clipboard as ClipboardDocumentIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CheckoutPixProps {
  session: any;
}

export const CheckoutPix: React.FC<CheckoutPixProps> = ({ session }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código PIX copiado!');
  };

  return (
    <Card title="Pagamento via PIX">
      <div className="text-center">
        {session.qr_code_pix && (
          <div className="mb-6">
            <img src={session.qr_code_pix} alt="QR Code PIX" className="mx-auto h-64 w-64" />
          </div>
        )}

        <div className="mb-4 rounded-md bg-gray-50 p-4">
          <p className="mb-2 text-sm text-gray-600">Código PIX Copia e Cola:</p>
          <div className="flex items-center justify-center gap-2">
            <code className="flex-1 overflow-x-auto rounded border border-gray-300 bg-white px-3 py-2 text-left text-sm">
              {session.pix_code}
            </code>
            <button
              onClick={() => copyToClipboard(session.pix_code)}
              className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
              aria-label="Copiar código PIX"
            >
              <ClipboardDocumentIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="rounded-md bg-blue-50 p-4">
          <p className="flex items-center justify-center text-sm text-blue-800">
            <QrCode className="mr-2 h-5 w-5" />
            Use o app do seu banco para escanear o QR Code ou copie o código acima
          </p>
        </div>

        {session.expira_em && (
          <p className="mt-4 text-sm text-gray-500">
            Este QR Code expira em:{' '}
            <span className="font-medium">
              {new Date(session.expira_em).toLocaleString('pt-BR')}
            </span>
          </p>
        )}
      </div>
    </Card>
  );
};
