import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreatePaymentCheckoutDto, UpdatePaymentPortalSettingsDto } from './dto/payment-portal.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentPortalService {
    private readonly logger = new Logger(PaymentPortalService.name);

    constructor(
        private readonly supabase: SupabaseClient,
    ) { }

    async updateSettings(tenantId: string, userId: string, dto: UpdatePaymentPortalSettingsDto) {
        // Upsert settings for tenant
        const { data, error } = await this.supabase
            .from('payment_portal_settings')
            .upsert({
                tenant_id: tenantId,
                firm_name: dto.firmName,
                primary_color: dto.primaryColor,
                enabled_payment_methods: dto.enabledPaymentMethods,
                // In real app, keys should be encrypted here
                updated_at: new Date().toISOString(),
            }, { onConflict: 'tenant_id' })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async getSettings(tenantId: string) {
        const { data, error } = await this.supabase
            .from('payment_portal_settings')
            .select('*')
            .eq('tenant_id', tenantId)
            .single();

        // If not found, return default/empty structure or null
        if (error && error.code === 'PGRST116') return null;
        if (error) throw new Error(error.message);
        return data;
    }

    async createCheckout(tenantId: string, userId: string, dto: CreatePaymentCheckoutDto) {
        const slug = uuidv4(); // Generate unique slug for public link

        const { data, error } = await this.supabase
            .from('payment_checkouts')
            .insert({
                tenant_id: tenantId,
                description: dto.description,
                amount: dto.amount,
                legal_fee_id: dto.legalFeeId,
                client_id: dto.clientId, // Corrected from payer_client_id based on migration 004
                slug: slug,
                status: 'active',
                created_by: userId
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // Public method - Bypass RLS typically, or use Service Role client. 
    // For this demo, assuming we have a tailored RPC or public policy, but here simulating logic.
    async getPublicCheckout(slug: string) {
        // NOTE: usage of this.supabase here implies authenticated client. 
        // In production, this method needs a SERVICE ROLE client to bypass RLS for public access, 
        // or the table must be public readable for specific columns.
        // For MVP validation, we assume backend can read.

        const { data, error } = await this.supabase
            .from('payment_checkouts')
            .select('*, settings:tenant_id(payment_portal_settings(*))') // Join settings
            .eq('slug', slug)
            .single();

        if (error || !data) throw new NotFoundException('Checkout link not found or expired');

        return {
            checkout: data,
            branding: data.settings // Contains firm name, logo, colors
        };
    }
}
