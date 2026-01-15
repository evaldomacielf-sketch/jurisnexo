import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { IPaymentService } from './payment.interface';
import {
    CreatePaymentIntentDto,
    CreateCheckoutSessionDto,
    PaymentIntentResult,
    PaymentSessionResult,
    PaymentStatus,
    RefundPaymentDto,
    RefundResult,
    WebhookEventResult,
} from '../dto/payment-integration.dto';
import * as crypto from 'crypto';

@Injectable()
export class AsaasPaymentService extends IPaymentService {
    private readonly logger = new Logger(AsaasPaymentService.name);
    private readonly apiClient: AxiosInstance;
    private readonly webhookSecret: string;
    private readonly baseUrl: string;

    constructor(private readonly configService: ConfigService) {
        super();
        const apiKey = this.configService.get<string>('ASAAS_API_KEY');
        const environment = this.configService.get<string>('ASAAS_ENVIRONMENT') || 'sandbox';

        this.baseUrl = environment === 'production'
            ? 'https://api.asaas.com/v3'
            : 'https://sandbox.asaas.com/api/v3';

        this.webhookSecret = this.configService.get<string>('ASAAS_WEBHOOK_SECRET') || '';

        this.apiClient = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'access_token': apiKey || '',
            },
        });
    }

    async createPaymentIntent(
        request: CreatePaymentIntentDto,
    ): Promise<PaymentIntentResult> {
        try {
            // First, ensure customer exists or create one
            const customerId = await this.ensureCustomer(request.clienteId, request.metadata);

            const billingType = this.mapPaymentMethod(request.metodoPagamento);

            const response = await this.apiClient.post('/payments', {
                customer: customerId,
                billingType,
                value: request.valor,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
                description: `Pagamento de honorário${request.honorarioId ? ` #${request.honorarioId}` : ''}`,
                externalReference: JSON.stringify({
                    escritorioId: request.escritorioId,
                    clienteId: request.clienteId,
                    honorarioId: request.honorarioId,
                    ...request.metadata,
                }),
            });

            const payment = response.data;

            // For PIX, get the QR code
            let qrCodePix: string | undefined;
            let pixCopyPaste: string | undefined;

            if (billingType === 'PIX' && payment.id) {
                try {
                    const pixResponse = await this.apiClient.get(`/payments/${payment.id}/pixQrCode`);
                    qrCodePix = pixResponse.data.encodedImage;
                    pixCopyPaste = pixResponse.data.payload;
                } catch (pixError) {
                    this.logger.warn('Could not generate PIX QR code', pixError);
                }
            }

            return {
                success: true,
                paymentId: payment.id,
                checkoutUrl: payment.invoiceUrl,
                qrCodePix,
                pixCopyPaste,
                expiresAt: payment.dueDate ? new Date(payment.dueDate) : undefined,
                status: payment.status,
            };
        } catch (error) {
            this.logger.error('Error creating Asaas payment', error);
            return {
                success: false,
                errorMessage: this.extractErrorMessage(error),
            };
        }
    }

    async createCheckoutSession(
        request: CreateCheckoutSessionDto,
    ): Promise<PaymentSessionResult> {
        // Asaas doesn't have a "checkout session" concept like Stripe
        // We create a payment and return the invoice URL
        const result = await this.createPaymentIntent({
            escritorioId: request.escritorioId,
            clienteId: request.clienteId,
            honorarioId: request.honorarioId,
            valor: request.valor,
            metodoPagamento: request.metodoPagamento,
            metadata: request.metadata,
        });

        return {
            success: result.success,
            sessionId: result.paymentId,
            checkoutUrl: result.checkoutUrl,
            qrCodePix: result.qrCodePix,
            pixCopyPaste: result.pixCopyPaste,
            expiresAt: result.expiresAt,
            errorMessage: result.errorMessage,
        };
    }

    async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
        try {
            const response = await this.apiClient.get(`/payments/${paymentId}`);
            const payment = response.data;

            return {
                paymentId: payment.id,
                status: this.mapAsaasStatus(payment.status),
                amount: payment.value,
                currency: 'brl',
                paidAt: payment.paymentDate ? new Date(payment.paymentDate) : undefined,
            };
        } catch (error) {
            this.logger.error('Error getting Asaas payment status', error);
            return {
                paymentId,
                status: 'failed',
                amount: 0,
                currency: 'brl',
                failureReason: this.extractErrorMessage(error),
            };
        }
    }

    async cancelPayment(paymentId: string): Promise<boolean> {
        try {
            await this.apiClient.delete(`/payments/${paymentId}`);
            return true;
        } catch (error) {
            this.logger.error('Error canceling Asaas payment', error);
            return false;
        }
    }

    async refundPayment(request: RefundPaymentDto): Promise<RefundResult> {
        try {
            const response = await this.apiClient.post(`/payments/${request.paymentId}/refund`, {
                value: request.amount,
                description: request.reason || 'Estorno solicitado',
            });

            return {
                success: true,
                refundId: response.data.id,
                refundedAmount: request.amount || response.data.value,
                status: 'succeeded',
            };
        } catch (error) {
            this.logger.error('Error refunding Asaas payment', error);
            return {
                success: false,
                errorMessage: this.extractErrorMessage(error),
            };
        }
    }

    async processWebhook(
        payload: string,
        signature: string,
    ): Promise<WebhookEventResult> {
        try {
            // Verify webhook signature if secret is configured
            if (this.webhookSecret) {
                const expectedSignature = crypto
                    .createHmac('sha256', this.webhookSecret)
                    .update(payload)
                    .digest('hex');

                if (signature !== expectedSignature) {
                    return {
                        success: false,
                        errorMessage: 'Invalid webhook signature',
                    };
                }
            }

            const event = JSON.parse(payload);
            const data: Record<string, any> = {};

            // Asaas webhook events
            switch (event.event) {
                case 'PAYMENT_RECEIVED':
                case 'PAYMENT_CONFIRMED':
                    data.paymentId = event.payment.id;
                    data.amount = event.payment.value;
                    data.paidAt = event.payment.paymentDate;
                    data.externalReference = event.payment.externalReference;
                    break;

                case 'PAYMENT_OVERDUE':
                case 'PAYMENT_DELETED':
                case 'PAYMENT_REFUNDED':
                    data.paymentId = event.payment.id;
                    data.status = event.event;
                    break;

                default:
                    this.logger.log(`Unhandled Asaas event type: ${event.event}`);
            }

            return {
                success: true,
                eventType: event.event,
                paymentId: data.paymentId,
                status: 'processed',
                data,
            };
        } catch (error) {
            this.logger.error('Error processing Asaas webhook', error);
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Webhook processing failed',
            };
        }
    }

    private async ensureCustomer(clienteId: string, metadata?: Record<string, string>): Promise<string> {
        // Try to find existing customer by externalReference
        try {
            const response = await this.apiClient.get('/customers', {
                params: { externalReference: clienteId },
            });

            if (response.data.data && response.data.data.length > 0) {
                return response.data.data[0].id;
            }
        } catch {
            // Customer not found, will create
        }

        // Create new customer
        const createResponse = await this.apiClient.post('/customers', {
            name: metadata?.clienteNome || 'Cliente',
            email: metadata?.clienteEmail || undefined,
            cpfCnpj: metadata?.cpfCnpj || undefined,
            externalReference: clienteId,
        });

        return createResponse.data.id;
    }

    private mapPaymentMethod(metodo: string): string {
        switch (metodo) {
            case 'pix':
                return 'PIX';
            case 'boleto':
                return 'BOLETO';
            case 'cartao_credito':
                return 'CREDIT_CARD';
            default:
                return 'PIX';
        }
    }

    private mapAsaasStatus(status: string): PaymentStatus['status'] {
        switch (status) {
            case 'RECEIVED':
            case 'CONFIRMED':
                return 'succeeded';
            case 'PENDING':
            case 'AWAITING_RISK_ANALYSIS':
                return 'pending';
            case 'REFUNDED':
            case 'DELETED':
                return 'canceled';
            case 'OVERDUE':
            case 'REJECTED':
                return 'failed';
            default:
                return 'pending';
        }
    }

    private extractErrorMessage(error: any): string {
        if (axios.isAxiosError(error)) {
            return error.response?.data?.errors?.[0]?.description || error.message;
        }
        return error instanceof Error ? error.message : 'Unknown error';
    }
}
