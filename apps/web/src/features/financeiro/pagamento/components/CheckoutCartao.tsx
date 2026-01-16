import React, { useState } from 'react';
import { Card } from '@/components/shared/Card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@/components/shared/FormField';
import { CreditCard } from 'lucide-react';

const schema = z.object({
  numero_cartao: z.string().min(16, 'Número do cartão inválido'),
  nome_titular: z.string().min(1, 'Nome é obrigatório'),
  validade: z.string().regex(/^\d{2}\/\d{2}$/, 'Formato inválido (MM/AA)'),
  cvv: z.string().length(3, 'CVV deve ter 3 dígitos'),
});

type FormData = z.infer<typeof schema>;

interface CheckoutCartaoProps {
  session: any;
}

export const CheckoutCartao: React.FC<CheckoutCartaoProps> = ({ session }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsProcessing(true);
    try {
      // Aqui seria a chamada para processar o pagamento via Stripe/Asaas
      console.log('Processando pagamento...', data);
      // TODO: Integrar com gateway
    } catch (error) {
      console.error('Erro ao processar pagamento', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card title="Pagamento com Cartão">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Número do Cartão"
          name="numero_cartao"
          register={register}
          errors={errors}
          required
          placeholder="0000 0000 0000 0000"
        />

        <FormField
          label="Nome do Titular"
          name="nome_titular"
          register={register}
          errors={errors}
          required
          placeholder="Como está impresso no cartão"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Validade"
            name="validade"
            register={register}
            errors={errors}
            required
            placeholder="MM/AA"
          />
          <FormField
            label="CVV"
            name="cvv"
            type="number"
            register={register}
            errors={errors}
            required
            placeholder="123"
          />
        </div>

        <div className="rounded-md bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-gray-700">Valor a pagar:</span>
            <span className="text-2xl font-bold text-gray-900">
              R$ {Number(session.valor).toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isProcessing ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Pagar Agora
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-500">🔒 Pagamento seguro e criptografado</p>
        </div>
      </form>
    </Card>
  );
};
