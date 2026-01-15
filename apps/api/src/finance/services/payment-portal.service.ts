import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UpdatePaymentPortalSettingsDto, CreatePaymentCheckoutDto, ProcessPaymentDto } from '../dto/payment-portal.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class PaymentPortalService {
    private readonly logger = new Logger(PaymentPortalService.name);

    constructor(
        private readonly supabase: SupabaseClient,
    ) { }

    async getSettings(tenantId: string) {
        const { data, error } = await this.supabase
            .from('finance_payment_portal_settings')
            .select('*')
            .eq('tenant_id', tenantId)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message); // PGRST116 is not found
        return data || {}; // Return empty object if not configured yet
    }

    async updateSettings(tenantId: string, dto: UpdatePaymentPortalSettingsDto) {
        // Upsert settings
        const { data, error } = await this.supabase
            .from('finance_payment_portal_settings')
            .upsert({
                tenant_id: tenantId,
                firm_name: dto.firmName,
                logo_url: dto.logoUrl,
                primary_color: dto.primaryColor,
                secondary_color: dto.secondaryColor,
                enabled_payment_methods: dto.enabledPaymentMethods,
                default_gateway: dto.defaultGateway,
                stripe_public_key: dto.stripePublicKey,
                stripe_secret_key: dto.stripeSecretKey,
                asaas_api_key: dto.asaasApiKey,
                asaas_environment: dto.asaasEnvironment,
                webhook_url: dto.webhookUrl,
                welcome_message: dto.welcomeMessage,
                terms_and_conditions: dto.termsAndConditions,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'tenant_id' })
            .select()
            .single();

        if (error) throw new Error(`Failed to update portal settings: ${error.message}`);
        return data;
    }

    async createCheckout(tenantId: string, userId: string, dto: CreatePaymentCheckoutDto) {
        const slug = randomBytes(16).toString('hex'); // Simple slug generation

        const { data, error } = await this.supabase
            .from('finance_payment_checkouts')
            .insert({
                tenant_id: tenantId,
                slug: slug,
                description: dto.description,
                amount: dto.amount,
                legal_fee_id: dto.legalFeeId,
                client_id: dto.clientId,
                expires_at: dto.expiresAt,
                payer_email: dto.payerEmail,
                payer_name: dto.payerName,
                allowed_payment_methods: dto.allowedPaymentMethods,
                status: 'pending',
                created_by: userId,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create checkout: ${error.message}`);
        return data;
    }

    async getCheckoutBySlug(slug: string) {
        const { data, error } = await this.supabase
            .from('finance_payment_checkouts')
            .select('*, tenant:tenant_id(name, finance_payment_portal_settings(*))')
            .eq('slug', slug)
            .single();

        if (error) return null;
        return data;
    }

    async processPayment(slug: string, dto: ProcessPaymentDto) {
        // 1. Get checkout
        const checkout = await this.getCheckoutBySlug(slug);
        if (!checkout) return { Success: false, Errors: ['Checkout not found'] };

        // 2. Determine Gateway
        // const gateway = checkout.tenant.finance_payment_portal_settings.default_gateway || 'stripe';

        // 3. Process with Gateway (Mock)
        this.logger.log(`Processing payment for checkout ${slug} via ${dto.paymentMethod}`);

        // Mock success
        const success = true;

        if (success) {
            await this.supabase
                .from('finance_payment_checkouts')
                .update({
                    status: 'paid',
                    payment_date: new Date().toISOString(),
                    payment_method: dto.paymentMethod,
                    payer_document: dto.payerDocument
                })
                .eq('id', checkout.id);

            return { Success: true, Message: 'Pagamento processado com sucesso' };
        }

        return { Success: false, Errors: ['Falha no processamento'] };
    }

    async processStripeWebhook(json: string, signature: string) {
        // Validate signature and event
        return { Success: true };
    }

    async processAsaasWebhook(data: any) {
        // Process event
        return { Success: true };
    }
}
