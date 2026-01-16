import React from 'react';
import { useCheckoutStatus } from '../hooks/usePagamento';
import { CheckoutPix } from '../components/CheckoutPix';
import { CheckoutCartao } from '../components/CheckoutCartao';
import { CheckoutSuccess } from '../components/CheckoutSuccess';

interface CheckoutPageProps {
  sessionId: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ sessionId }) => {
  const { data: session, isLoading } = useCheckoutStatus(sessionId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Sessão não encontrada</h2>
          <p className="text-gray-600">Esta sessão de pagamento não existe ou expirou.</p>
        </div>
      </div>
    );
  }

  if (session.status === 'pago') {
    return <CheckoutSuccess session={session} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header White-Label */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          {session.escritorio?.logo_url && (
            <img
              src={session.escritorio.logo_url}
              alt={session.escritorio.nome}
              className="mb-4 h-16 object-contain"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {session.escritorio?.nome || 'Pagamento de Honorários'}
          </h1>
          <p className="mt-2 text-gray-600">Complete o pagamento de forma segura</p>
        </div>

        {/* Informações do Pagamento */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold">Detalhes do Pagamento</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium">{session.cliente?.nome}</span>
            </div>
            {session.honorario && (
              <div className="flex justify-between">
                <span className="text-gray-600">Referência:</span>
                <span className="font-medium">Honorário #{session.honorario.id}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3 text-xl font-bold">
              <span>Total:</span>
              <span>R$ {Number(session.valor).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Métodos de Pagamento */}
        {session.metodo_pagamento === 'pix' ? (
          <CheckoutPix session={session} />
        ) : (
          <CheckoutCartao session={session} />
        )}
      </div>
    </div>
  );
};
