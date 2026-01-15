import {
    Controller,
    Post,
    Body,
    Headers,
    HttpCode,
    HttpStatus,
    Logger,
    RawBodyRequest,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { StripePaymentService } from './services/stripe-payment.service';
import { AsaasPaymentService } from './services/asaas-payment.service';
import { EmailService } from './services/email.service';
import { SupabaseClient } from '@supabase/supabase-js';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(
        private readonly stripeService: StripePaymentService,
        private readonly asaasService: AsaasPaymentService,
        private readonly emailService: EmailService,
        private readonly supabase: SupabaseClient,
    ) { }

    @Post('stripe')
    @HttpCode(HttpStatus.OK)
    @ApiExcludeEndpoint()
    async handleStripeWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        this.logger.log('Received Stripe webhook');

        const payload = req.rawBody?.toString() || '';
        const result = await this.stripeService.processWebhook(payload, signature);

        if (!result.success) {
            this.logger.error('Stripe webhook processing failed', result.errorMessage);
            return { received: false, error: result.errorMessage };
        }

        // Process payment events
        await this.handlePaymentEvent(result.eventType || '', result.data || {}, 'stripe');

        return { received: true };
    }

    @Post('asaas')
    @HttpCode(HttpStatus.OK)
    @ApiExcludeEndpoint()
    async handleAsaasWebhook(
        @Body() body: any,
        @Headers('asaas-access-token') signature: string,
    ) {
        this.logger.log('Received Asaas webhook');

        const payload = JSON.stringify(body);
        const result = await this.asaasService.processWebhook(payload, signature);

        if (!result.success) {
            this.logger.error('Asaas webhook processing failed', result.errorMessage);
            return { received: false, error: result.errorMessage };
        }

        // Process payment events
        await this.handlePaymentEvent(result.eventType || '', result.data || {}, 'asaas');

        return { received: true };
    }

    private async handlePaymentEvent(
        eventType: string,
        data: Record<string, any>,
        provider: 'stripe' | 'asaas',
    ) {
        try {
            const paymentSuccessEvents = [
                'payment_intent.succeeded',
                'checkout.session.completed',
                'PAYMENT_RECEIVED',
                'PAYMENT_CONFIRMED',
            ];

            if (paymentSuccessEvents.includes(eventType)) {
                await this.onPaymentSuccess(data, provider);
            }

            const paymentFailedEvents = [
                'payment_intent.payment_failed',
                'PAYMENT_OVERDUE',
                'PAYMENT_DELETED',
            ];

            if (paymentFailedEvents.includes(eventType)) {
                await this.onPaymentFailed(data, provider);
            }

            if (eventType === 'PAYMENT_REFUNDED') {
                await this.onPaymentRefunded(data, provider);
            }
        } catch (error) {
            this.logger.error('Error handling payment event', error);
        }
    }

    private async onPaymentSuccess(data: Record<string, any>, provider: string) {
        this.logger.log(`Payment success from ${provider}:`, data.paymentId);

        // Extract metadata from payment
        let honorarioId: string | undefined;
        let clienteId: string | undefined;
        let escritorioId: string | undefined;

        if (data.metadata) {
            honorarioId = data.metadata.honorarioId;
            clienteId = data.metadata.clienteId;
            escritorioId = data.metadata.escritorioId;
        } else if (data.externalReference) {
            try {
                const ref = JSON.parse(data.externalReference);
                honorarioId = ref.honorarioId;
                clienteId = ref.clienteId;
                escritorioId = ref.escritorioId;
            } catch {
                // External reference is not JSON
            }
        }

        // Update payment checkout status
        if (data.sessionId || data.paymentId) {
            const checkoutId = data.sessionId || data.paymentId;
            await this.supabase
                .from('payment_checkouts')
                .update({
                    status: 'pago',
                    paid_at: new Date().toISOString(),
                    gateway_payment_id: data.paymentId,
                })
                .eq('gateway_session_id', checkoutId);
        }

        // Update legal fee if linked
        if (honorarioId) {
            // Record payment
            await this.supabase
                .from('legal_fee_payments')
                .insert({
                    legal_fee_id: honorarioId,
                    amount: data.amount,
                    payment_date: new Date().toISOString(),
                    payment_method: provider === 'stripe' ? 'cartao_credito' : 'pix',
                    gateway_transaction_id: data.paymentId,
                    notes: `Pagamento automático via ${provider}`,
                });

            // Update legal fee totals (trigger should handle this)
        }

        // Send confirmation email
        if (clienteId) {
            const { data: cliente } = await this.supabase
                .from('clients')
                .select('name, email')
                .eq('id', clienteId)
                .single();

            const { data: escritorio } = await this.supabase
                .from('tenants')
                .select('name')
                .eq('id', escritorioId)
                .single();

            if (cliente?.email) {
                await this.emailService.sendPaymentConfirmation(cliente.email, {
                    clienteNome: cliente.name,
                    escritorioNome: escritorio?.name || 'JurisNexo',
                    valor: data.amount,
                    numeroHonorario: honorarioId,
                });
            }
        }
    }

    private async onPaymentFailed(data: Record<string, any>, provider: string) {
        this.logger.warn(`Payment failed from ${provider}:`, data.paymentId);

        // Update checkout status
        if (data.sessionId || data.paymentId) {
            const checkoutId = data.sessionId || data.paymentId;
            await this.supabase
                .from('payment_checkouts')
                .update({
                    status: 'falhou',
                    gateway_payment_id: data.paymentId,
                })
                .eq('gateway_session_id', checkoutId);
        }
    }

    private async onPaymentRefunded(data: Record<string, any>, provider: string) {
        this.logger.log(`Payment refunded from ${provider}:`, data.paymentId);

        // Update checkout status
        if (data.paymentId) {
            await this.supabase
                .from('payment_checkouts')
                .update({
                    status: 'estornado',
                })
                .eq('gateway_payment_id', data.paymentId);
        }
    }
}
