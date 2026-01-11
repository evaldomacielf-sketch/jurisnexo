import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'JurisNexo - CRM Jurídico',
    description: 'CRM jurídico completo para escritórios de advocacia',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className="antialiased">{children}</body>
        </html>
    );
}
