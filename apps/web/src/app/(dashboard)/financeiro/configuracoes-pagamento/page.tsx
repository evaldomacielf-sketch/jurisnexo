"use client";

import { PaymentPortalSettingsForm } from "@/components/finance/PaymentPortalSettingsForm";

export default function PaymentPortalSettingsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Configuração do Portal
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Personalize a aparência e os gateways de pagamento do seu portal de clientes.
                </p>
            </div>

            <PaymentPortalSettingsForm />
        </div>
    );
}
