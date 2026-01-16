import React from 'react';
import { Card } from '@/components/shared/Card';
import { CheckCircle } from 'lucide-react';

interface CheckoutSuccessProps {
  session: any;
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ session }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md px-4">
        <Card>
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Pagamento Confirmado!</h2>
            <p className="mb-6 text-gray-600">
              Obrigado! Seu pagamento de R$ {Number(session.valor).toFixed(2)} foi processado com
              sucesso.
            </p>
            {session.recibo_url && (
              <a
                href={session.recibo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
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
