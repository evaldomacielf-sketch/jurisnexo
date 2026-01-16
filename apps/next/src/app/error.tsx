'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { logger } from '@/lib/logger'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log do erro para monitoramento
        logger.error('Global Error Boundary caught an error', error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle size={40} />
            </div>

            <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
                Algo deu errado!
            </h1>

            <p className="mb-8 max-w-md text-muted-foreground">
                Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada e estamos trabalhando para resolver.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                    onClick={() => reset()}
                    variant="default"
                    className="flex items-center gap-2"
                >
                    <RefreshCw size={18} />
                    Tentar novamente
                </Button>

                <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Home size={18} />
                    Voltar para o Início
                </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-12 max-w-2xl overflow-auto rounded-lg border bg-muted p-4 text-left font-mono text-xs text-muted-foreground">
                    <p className="mb-2 font-bold text-destructive">Debug Info:</p>
                    <pre>{error.stack || error.message}</pre>
                </div>
            )}
        </div>
    )
}
