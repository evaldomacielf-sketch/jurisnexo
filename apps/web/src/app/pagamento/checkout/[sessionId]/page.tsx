import { CheckoutPage } from '@/features/financeiro/pagamento/pages/CheckoutPage';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;

  if (!sessionId) {
    notFound();
  }

  return <CheckoutPage sessionId={sessionId} />;
}
