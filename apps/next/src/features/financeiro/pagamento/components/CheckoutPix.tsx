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
                        <img
                            src={session.qr_code_pix}
                            alt="QR Code PIX"
                            className="mx-auto w-64 h-64"
                        />
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-gray-600 mb-2">Código PIX Copia e Cola:</p>
                    <div className="flex items-center justify-center gap-2">
                        <code className="text-sm bg-white px-3 py-2 rounded border border-gray-300 flex-1 text-left overflow-x-auto">
                            {session.pix_code}
                        </code>
                        <button
                            onClick={() => copyToClipboard(session.pix_code)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                            aria-label="Copiar código PIX"
                        >
                            <ClipboardDocumentIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-blue-800 flex items-center justify-center">
                        <QrCode className="h-5 w-5 mr-2" />
                        Use o app do seu banco para escanear o QR Code ou copie o código acima
                    </p>
                </div>

                {session.expira_em && (
                    <p className="text-sm text-gray-500 mt-4">
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
