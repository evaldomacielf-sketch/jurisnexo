'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { formatCurrency } from '@/utils/format';

export default function PublicCheckoutPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCheckout = async () => {
      // NOTE: This call should ideally use a public endpoint that doesn't require auth
      // For this demo, we assume the API allows it or we handle it in middleware
      try {
        const response = await api.get(`/finance/payment-portal/public/${slug}`);
        setCheckoutData(response.data);
      } catch (err) {
        console.error('Error fetching checkout link:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCheckout();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !checkoutData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>Link Inválido ou Expirado</CardTitle>
            <CardDescription>
              Não foi possível encontrar as informações de pagamento.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline">Entrar em contato com o suporte</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { checkout, branding } = checkoutData;
  const primaryColor = branding?.primary_color || '#000000';

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-12 dark:bg-slate-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Branding Header */}
        <div className="text-center">
          {/* Logo placeholder */}
          <div className="branding-logo mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white shadow-lg">
            {branding?.firm_name?.charAt(0) || 'J'}
          </div>
          <style jsx>{`
            .branding-logo {
              background-color: ${primaryColor};
            }
          `}</style>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {branding?.firm_name || 'Portal de Pagamento'}
          </h2>
        </div>

        <Card className="branding-card border-t-4 shadow-xl">
          <style jsx>{`
            :global(.branding-card) {
              border-top-color: ${primaryColor} !important;
            }
          `}</style>
          <CardHeader className="border-b pb-6 text-center">
            <CardDescription className="mb-2 text-xs font-semibold uppercase tracking-wide">
              Total a Pagar
            </CardDescription>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatCurrency(checkout.amount)}
            </div>
            <p className="mt-2 text-sm text-slate-500">{checkout.description}</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-2 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Checkout Seguro</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Escolha abaixo a forma de pagamento desejada para prosseguir.
              </p>
            </div>

            <Button className="branding-button h-12 w-full text-lg">Pagar com Cartão ou PIX</Button>
            <style jsx>{`
              :global(.branding-button) {
                background-color: ${primaryColor} !important;
              }
            `}</style>
          </CardContent>
          <CardFooter className="rounded-b-lg bg-slate-50 p-4 text-center dark:bg-slate-800/50">
            <p className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" /> Pagamento processado com segurança
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
