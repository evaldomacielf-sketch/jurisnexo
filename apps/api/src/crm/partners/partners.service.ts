import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CrmService } from '../crm.service';

@Injectable()
export class PartnersService {
    private readonly logger = new Logger(PartnersService.name);

    constructor(
        private readonly db: DatabaseService,
        @Inject(forwardRef(() => CrmService))
        private readonly crmService: CrmService,
    ) { }

    async createPartner(tenantId: string, data: { name: string; phone: string; email: string; areas: string[] }) {
        const { data: partner, error } = await this.db.client
            .from('crm_partners')
            .insert({ ...data, tenant_id: tenantId })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return partner;
    }

    async listPartners(tenantId: string) {
        const { data, error } = await this.db.client
            .from('crm_partners')
            .select('*')
            .eq('tenant_id', tenantId);

        if (error) throw new Error(error.message);
        return data;
    }

    // Round-Robin Selection
    async findBestPartner(tenantId: string, area: string) {
        // 1. Find Active partners with area
        // 2. Order by last_referral_at ASC (Standard Round Robin)
        // Note: Supabase array column filtering needed

        const { data: partners, error } = await this.db.client
            .from('crm_partners')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('status', 'ACTIVE')
            .contains('areas', [area])
            .order('last_referral_at', { ascending: true, nullsFirst: true })
            .limit(1);

        if (error) {
            this.logger.error('Error finding partner', error);
            return null;
        }

        return partners?.[0] || null;
    }

    // --- Consent Flow ---

    async requestConsent(tenantId: string, conversationId: string) {
        // 1. Update State
        await this.db.client
            .from('crm_conversations')
            .update({ referral_state: 'WAITING_CONSENT' } as any)
            .eq('id', conversationId);

        // 2. Send Message
        await this.crmService.sendMessage(
            tenantId,
            conversationId,
            "Nossa equipe de especialistas está ocupada no momento. Podemos encaminhar seu caso para um advogado parceiro certificado por nós? Responda SIM ou NÃO."
        );

        // 3. Audit
        await this.db.client.from('crm_audit_logs').insert({
            tenant_id: tenantId,
            entity_type: 'CONVERSATION',
            entity_id: conversationId,
            action: 'CONSENT_REQUESTED',
        });
    }

    async handleConsentResponse(tenantId: string, conversationId: string, content: string) {
        const clean = content.trim().toUpperCase();

        if (clean === 'SIM' || clean === 'S') {
            await this.executeReferral(tenantId, conversationId);
        } else if (clean === 'NAO' || clean === 'N' || clean === 'NÃO') {
            await this.handleRefusal(tenantId, conversationId);
        } else {
            // Unclear response, maybe repeat asking? For MVP ignore or treat same state
        }
    }

    private async executeReferral(tenantId: string, conversationId: string) {
        // 1. Determine Area (Mock 'Civil' for MVP, or extract from tags/context)
        const area = 'CIVIL';

        // 2. Find Partner
        const partner = await this.findBestPartner(tenantId, area);

        if (!partner) {
            await this.crmService.sendMessage(tenantId, conversationId, "Desculpe, não encontramos parceiros disponíveis no momento. Um de nossos atendentes falará com você em breve.");

            await this.db.client.from('crm_audit_logs').insert({
                tenant_id: tenantId,
                entity_type: 'CONVERSATION',
                entity_id: conversationId,
                action: 'REFERRAL_FAILED_NO_PARTNER',
            });

            // Fallback Offer Meeting could go here
            return;
        }

        // 3. Create Referral Record
        await this.db.client.from('crm_referrals').insert({
            tenant_id: tenantId,
            conversation_id: conversationId,
            partner_id: partner.id,
            status: 'PENDING'
        });

        // 4. Update Partner Last Referral
        await this.db.client.from('crm_partners').update({ last_referral_at: new Date().toISOString() }).eq('id', partner.id);

        // 5. Send WhatsApp Template to Partner (Mock)
        this.logger.log(`[WhatsApp Template] To Partner ${partner.phone}: REFERRAL_PARTNER { client_phone: ..., urgency: ... }`);

        // 6. Notify User
        await this.crmService.sendMessage(tenantId, conversationId, `Ótimo! Encaminhamos seu caso para o Dr(a). ${partner.name}. Ele(a) entrará em contato em breve.`);

        // 7. Update Conversation State
        await this.db.client.from('crm_conversations').update({ referral_state: 'REFERRED' } as any).eq('id', conversationId);

        // 8. Audit
        await this.db.client.from('crm_audit_logs').insert({
            tenant_id: tenantId,
            entity_type: 'CONVERSATION',
            entity_id: conversationId,
            action: 'REFERRED_TO_PARTNER',
            new_value: { partner_id: partner.id }
        });
    }

    private async handleRefusal(tenantId: string, conversationId: string) {
        // 1. Fallback Message
        await this.crmService.sendMessage(tenantId, conversationId, "Sem problemas. Gostaria de agendar uma reunião com nossa equipe interna?");

        // 2. Update State
        await this.db.client.from('crm_conversations').update({ referral_state: 'NONE' } as any).eq('id', conversationId);

        // 3. Audit
        await this.db.client.from('crm_audit_logs').insert({
            tenant_id: tenantId,
            entity_type: 'CONVERSATION',
            entity_id: conversationId,
            action: 'CONSENT_DENIED',
        });
    }
}
