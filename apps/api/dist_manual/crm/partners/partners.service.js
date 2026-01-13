"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PartnersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const crm_service_1 = require("../crm.service");
let PartnersService = PartnersService_1 = class PartnersService {
    constructor(db, crmService) {
        this.db = db;
        this.crmService = crmService;
        this.logger = new common_1.Logger(PartnersService_1.name);
    }
    async createPartner(tenantId, data) {
        const { data: partner, error } = await this.db.client
            .from('crm_partners')
            .insert({ ...data, tenant_id: tenantId })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return partner;
    }
    async listPartners(tenantId) {
        const { data, error } = await this.db.client
            .from('crm_partners')
            .select('*')
            .eq('tenant_id', tenantId);
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Round-Robin Selection
    async findBestPartner(tenantId, area) {
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
    async requestConsent(tenantId, conversationId) {
        // 1. Update State
        await this.db.client
            .from('crm_conversations')
            .update({ referral_state: 'WAITING_CONSENT' })
            .eq('id', conversationId);
        // 2. Send Message
        await this.crmService.sendMessage(tenantId, conversationId, "Nossa equipe de especialistas está ocupada no momento. Podemos encaminhar seu caso para um advogado parceiro certificado por nós? Responda SIM ou NÃO.");
        // 3. Audit
        await this.db.client.from('crm_audit_logs').insert({
            tenant_id: tenantId,
            entity_type: 'CONVERSATION',
            entity_id: conversationId,
            action: 'CONSENT_REQUESTED',
        });
    }
    async handleConsentResponse(tenantId, conversationId, content) {
        const clean = content.trim().toUpperCase();
        if (clean === 'SIM' || clean === 'S') {
            await this.executeReferral(tenantId, conversationId);
        }
        else if (clean === 'NAO' || clean === 'N' || clean === 'NÃO') {
            await this.handleRefusal(tenantId, conversationId);
        }
        else {
            // Unclear response, maybe repeat asking? For MVP ignore or treat same state
        }
    }
    async executeReferral(tenantId, conversationId) {
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
        await this.db.client.from('crm_conversations').update({ referral_state: 'REFERRED' }).eq('id', conversationId);
        // 8. Audit
        await this.db.client.from('crm_audit_logs').insert({
            tenant_id: tenantId,
            entity_type: 'CONVERSATION',
            entity_id: conversationId,
            action: 'REFERRED_TO_PARTNER',
            new_value: { partner_id: partner.id }
        });
    }
    async handleRefusal(tenantId, conversationId) {
        // 1. Fallback Message
        await this.crmService.sendMessage(tenantId, conversationId, "Sem problemas. Gostaria de agendar uma reunião com nossa equipe interna?");
        // 2. Update State
        await this.db.client.from('crm_conversations').update({ referral_state: 'NONE' }).eq('id', conversationId);
        // 3. Audit
        await this.db.client.from('crm_audit_logs').insert({
            tenant_id: tenantId,
            entity_type: 'CONVERSATION',
            entity_id: conversationId,
            action: 'CONSENT_DENIED',
        });
    }
};
exports.PartnersService = PartnersService;
exports.PartnersService = PartnersService = PartnersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => crm_service_1.CrmService))),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        crm_service_1.CrmService])
], PartnersService);
//# sourceMappingURL=partners.service.js.map