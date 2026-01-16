import React from 'react';
import { Card } from '@/components/shared/Card';
import { CheckCircle } from 'lucide-react';

interface CheckoutSuccessProps {
    session: any;
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ session }) => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
            <div className="max-w-md w-full px-4">
                <Card>
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h2>
                        <p className="text-gray-600 mb-6">
                            Obrigado! Seu pagamento de R$ {Number(session.valor).toFixed(2)} foi processado com sucesso.
                        </p>
                        {session.recibo_url && (
                            <a
                                href={session.recibo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Baixar Recibo
                            </a>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
