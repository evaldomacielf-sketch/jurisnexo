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

/**
 * Abstract Payment Service Interface
 * Implemented by StripePaymentService and AsaasPaymentService
 */
export abstract class IPaymentService {
    abstract createPaymentIntent(
        request: CreatePaymentIntentDto,
    ): Promise<PaymentIntentResult>;

    abstract createCheckoutSession(
        request: CreateCheckoutSessionDto,
    ): Promise<PaymentSessionResult>;

    abstract getPaymentStatus(paymentId: string): Promise<PaymentStatus>;

    abstract cancelPayment(paymentId: string): Promise<boolean>;

    abstract refundPayment(request: RefundPaymentDto): Promise<RefundResult>;

    abstract processWebhook(
        payload: string,
        signature: string,
    ): Promise<WebhookEventResult>;
}
