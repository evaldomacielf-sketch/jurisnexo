// Payment Gateway Integration DTOs
// Based on Document 4 specifications, translated to TypeScript for NestJS

export interface CreatePaymentIntentDto {
    escritorioId: string;
    clienteId: string;
    honorarioId?: string;
    valor: number;
    currency?: string; // Default: 'brl'
    metodoPagamento: 'pix' | 'cartao_credito' | 'boleto';
    metadata?: Record<string, string>;
}

export interface CreateCheckoutSessionDto {
    escritorioId: string;
    clienteId: string;
    clienteEmail: string;
    clienteNome?: string;
    honorarioId?: string;
    valor: number;
    metodoPagamento: 'pix' | 'cartao_credito' | 'boleto';
    successUrl?: string;
    cancelUrl?: string;
    metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
    success: boolean;
    paymentId?: string;
    clientSecret?: string;
    checkoutUrl?: string;
    qrCodePix?: string;
    pixCopyPaste?: string;
    expiresAt?: Date;
    status?: string;
    errorMessage?: string;
}

export interface PaymentSessionResult {
    success: boolean;
    sessionId?: string;
    checkoutUrl?: string;
    qrCodePix?: string;
    pixCopyPaste?: string;
    expiresAt?: Date;
    errorMessage?: string;
}

export interface PaymentStatus {
    paymentId: string;
    status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    amount: number;
    currency: string;
    paidAt?: Date;
    failureReason?: string;
}

export interface RefundPaymentDto {
    paymentId: string;
    amount?: number; // Null = full refund
    reason?: string;
}

export interface RefundResult {
    success: boolean;
    refundId?: string;
    refundedAmount?: number;
    status?: string;
    errorMessage?: string;
}

export interface WebhookEventResult {
    success: boolean;
    eventType?: string;
    paymentId?: string;
    status?: string;
    data?: Record<string, any>;
    errorMessage?: string;
}

// Provider-specific configs
export interface StripeConfig {
    apiKey: string;
    publishableKey: string;
    webhookSecret: string;
    currency: string;
    successUrl: string;
    cancelUrl: string;
}

export interface AsaasConfig {
    apiKey: string;
    baseUrl: string;
    environment: 'sandbox' | 'production';
    webhookSecret: string;
}
