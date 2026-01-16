export const logger = {
    info: (message: string, meta?: object) => {
        console.log(`[INFO] ${message}`, meta || '')
        // TODO: Enviar para serviço de logs (Sentry, LogRocket)
    },
    error: (message: string, error?: Error | unknown) => {
        console.error(`[ERROR] ${message}`, error)
        // TODO: Enviar para Sentry
    },
}
