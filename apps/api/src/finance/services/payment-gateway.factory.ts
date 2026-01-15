import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripePaymentService } from './stripe-payment.service';
import { AsaasPaymentService } from './asaas-payment.service';
import { IPaymentService } from './payment.interface';

export type PaymentGateway = 'stripe' | 'asaas';

/**
 * Factory service to select the appropriate payment gateway
 * based on configuration or request parameters.
 * 
 * Usage:
 * ```typescript
 * const gateway = this.gatewayFactory.getGateway(); // Uses default from config
 * const stripeGateway = this.gatewayFactory.getGateway('stripe'); // Force Stripe
 * ```
 */
@Injectable()
export class PaymentGatewayFactory {
    private readonly logger = new Logger(PaymentGatewayFactory.name);
    private readonly defaultGateway: PaymentGateway;

    constructor(
        private readonly configService: ConfigService,
        private readonly stripeService: StripePaymentService,
        private readonly asaasService: AsaasPaymentService,
    ) {
        const configured = this.configService.get<string>('PAYMENT_GATEWAY');
        this.defaultGateway = (configured?.toLowerCase() as PaymentGateway) || 'stripe';
        this.logger.log(`Default payment gateway: ${this.defaultGateway}`);
    }

    /**
     * Get the payment service based on gateway name.
     * @param gateway - Optional gateway override ('stripe' | 'asaas')
     * @returns The appropriate IPaymentService implementation
     */
    getGateway(gateway?: PaymentGateway): IPaymentService {
        const selectedGateway = gateway || this.defaultGateway;

        switch (selectedGateway) {
            case 'asaas':
                return this.asaasService;
            case 'stripe':
            default:
                return this.stripeService;
        }
    }

    /**
     * Get gateway based on payment method preference.
     * PIX/Boleto typically use Asaas in Brazil, Card uses Stripe.
     */
    getGatewayByPaymentMethod(method: string): IPaymentService {
        switch (method?.toLowerCase()) {
            case 'pix':
            case 'boleto':
                // Asaas has better support for Brazilian payment methods
                return this.asaasService;
            case 'cartao_credito':
            case 'card':
                // Stripe has better international card support
                return this.stripeService;
            default:
                return this.getGateway();
        }
    }

    /**
     * Get the default gateway name
     */
    getDefaultGatewayName(): PaymentGateway {
        return this.defaultGateway;
    }
}
