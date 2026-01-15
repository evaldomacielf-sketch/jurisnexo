"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/utils/format";

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
                console.error("Error fetching checkout link:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchCheckout();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !checkoutData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-red-100 p-3 rounded-full mb-4">
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                {/* Branding Header */}
                <div className="text-center">
                    {/* Logo placeholder */}
                    <div
                        className="h-16 w-16 mx-auto rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {branding?.firm_name?.charAt(0) || 'J'}
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                        {branding?.firm_name || 'Portal de Pagamento'}
                    </h2>
                </div>

                <Card className="shadow-xl border-t-4" style={{ borderTopColor: primaryColor }}>
                    <CardHeader className="text-center border-b pb-6">
                        <CardDescription className="uppercase tracking-wide text-xs font-semibold mb-2">
                            Total a Pagar
                        </CardDescription>
                        <div className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
                            {formatCurrency(checkout.amount)}
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                            {checkout.description}
                        </p>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium">Checkout Seguro</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Escolha abaixo a forma de pagamento desejada para prosseguir.
                            </p>
                        </div>

                        <Button className="w-full h-12 text-lg" style={{ backgroundColor: primaryColor }}>
                            Pagar com Cartão ou PIX
                        </Button>
                    </CardContent>
                    <CardFooter className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center rounded-b-lg">
                        <p className="text-xs text-muted-foreground w-full flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Pagamento processado com segurança
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
