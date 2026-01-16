import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { TenantProvider } from '@/providers/TenantProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'JurisNexo - CRM Jurídico',
  description: 'CRM jurídico completo para escritórios de advocacia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TenantProvider>{children}</TenantProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
