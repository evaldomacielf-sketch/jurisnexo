import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
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

@Injectable()
export class StripePaymentService extends IPaymentService {
    private readonly logger = new Logger(StripePaymentService.name);
    private readonly stripe: Stripe;
    private readonly webhookSecret: string;
    private readonly successUrl: string;
    private readonly cancelUrl: string;

    constructor(private readonly configService: ConfigService) {
        super();
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
        this.successUrl = this.configService.get<string>('STRIPE_SUCCESS_URL') || 'https://app.jurisnexo.com/pagamento/sucesso';
        this.cancelUrl = this.configService.get<string>('STRIPE_CANCEL_URL') || 'https://app.jurisnexo.com/pagamento/cancelado';

        if (!apiKey) {
            this.logger.warn('Stripe API key not configured');
            this.stripe = null as any;
        } else {
            this.stripe = new Stripe(apiKey, {
                apiVersion: '2024-12-18.acacia',
            });
        }
    }

    async createPaymentIntent(
        request: CreatePaymentIntentDto,
    ): Promise<PaymentIntentResult> {
        try {
            if (!this.stripe) {
                return { success: false, errorMessage: 'Stripe not configured' };
            }

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(request.valor * 100), // Stripe uses cents
                currency: request.currency || 'brl',
                payment_method_types: this.getPaymentMethodTypes(request.metodoPagamento),
                metadata: {
                    escritorioId: request.escritorioId,
                    clienteId: request.clienteId,
                    honorarioId: request.honorarioId || '',
                    ...request.metadata,
                },
            });

            return {
                success: true,
                paymentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret || undefined,
                status: paymentIntent.status,
            };
        } catch (error) {
            this.logger.error('Error creating Stripe payment intent', error);
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async createCheckoutSession(
        request: CreateCheckoutSessionDto,
    ): Promise<PaymentSessionResult> {
        try {
            if (!this.stripe) {
                return { success: false, errorMessage: 'Stripe not configured' };
            }

            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: this.getPaymentMethodTypes(request.metodoPagamento),
                line_items: [
                    {
                        price_data: {
                            currency: 'brl',
                            product_data: {
                                name: request.honorarioId
                                    ? `Honorário #${request.honorarioId}`
                                    : 'Pagamento de Honorários',
                                description: `Pagamento para ${request.clienteNome || 'Cliente'}`,
                            },
                            unit_amount: Math.round(request.valor * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: request.successUrl || this.successUrl,
                cancel_url: request.cancelUrl || this.cancelUrl,
                customer_email: request.clienteEmail,
                metadata: {
                    escritorioId: request.escritorioId,
                    clienteId: request.clienteId,
                    honorarioId: request.honorarioId || '',
                    ...request.metadata,
                },
            });

            return {
                success: true,
                sessionId: session.id,
                checkoutUrl: session.url || undefined,
            };
        } catch (error) {
            this.logger.error('Error creating Stripe checkout session', error);
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
        try {
            if (!this.stripe) {
                throw new Error('Stripe not configured');
            }

            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

            return {
                paymentId: paymentIntent.id,
                status: this.mapStripeStatus(paymentIntent.status),
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                paidAt: paymentIntent.status === 'succeeded' ? new Date() : undefined,
            };
        } catch (error) {
            this.logger.error('Error getting Stripe payment status', error);
            return {
                paymentId,
                status: 'failed',
                amount: 0,
                currency: 'brl',
                failureReason: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async cancelPayment(paymentId: string): Promise<boolean> {
        try {
            if (!this.stripe) {
                return false;
            }

            await this.stripe.paymentIntents.cancel(paymentId);
            return true;
        } catch (error) {
            this.logger.error('Error canceling Stripe payment', error);
            return false;
        }
    }

    async refundPayment(request: RefundPaymentDto): Promise<RefundResult> {
        try {
            if (!this.stripe) {
                return { success: false, errorMessage: 'Stripe not configured' };
            }

            const refund = await this.stripe.refunds.create({
                payment_intent: request.paymentId,
                amount: request.amount ? Math.round(request.amount * 100) : undefined,
                reason: request.reason as Stripe.RefundCreateParams.Reason || 'requested_by_customer',
            });

            return {
                success: true,
                refundId: refund.id,
                refundedAmount: refund.amount / 100,
                status: refund.status || 'succeeded',
            };
        } catch (error) {
            this.logger.error('Error refunding Stripe payment', error);
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async processWebhook(
        payload: string,
        signature: string,
    ): Promise<WebhookEventResult> {
        try {
            if (!this.stripe || !this.webhookSecret) {
                return { success: false, errorMessage: 'Stripe webhooks not configured' };
            }

            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                this.webhookSecret,
            );

            const data: Record<string, any> = {};

            switch (event.type) {
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;
                    data.paymentId = paymentIntent.id;
                    data.amount = paymentIntent.amount / 100;
                    data.metadata = paymentIntent.metadata;
                    break;

                case 'payment_intent.payment_failed':
                    const failedPayment = event.data.object as Stripe.PaymentIntent;
                    data.paymentId = failedPayment.id;
                    data.failureReason = failedPayment.last_payment_error?.message;
                    break;

                case 'checkout.session.completed':
                    const session = event.data.object as Stripe.Checkout.Session;
                    data.sessionId = session.id;
                    data.paymentId = session.payment_intent;
                    data.metadata = session.metadata;
                    break;

                default:
                    this.logger.log(`Unhandled Stripe event type: ${event.type}`);
            }

            return {
                success: true,
                eventType: event.type,
                paymentId: data.paymentId,
                status: 'processed',
                data,
            };
        } catch (error) {
            this.logger.error('Error processing Stripe webhook', error);
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Webhook verification failed',
            };
        }
    }

    private getPaymentMethodTypes(metodo: string): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
        switch (metodo) {
            case 'pix':
                return ['pix'];
            case 'boleto':
                return ['boleto'];
            case 'cartao_credito':
            default:
                return ['card'];
        }
    }

    private mapStripeStatus(status: string): PaymentStatus['status'] {
        switch (status) {
            case 'succeeded':
                return 'succeeded';
            case 'processing':
                return 'processing';
            case 'canceled':
                return 'canceled';
            case 'requires_payment_method':
            case 'requires_confirmation':
            case 'requires_action':
                return 'pending';
            default:
                return 'failed';
        }
    }
}
