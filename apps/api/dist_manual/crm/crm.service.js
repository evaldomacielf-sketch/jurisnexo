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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const urgency_service_1 = require("./urgency.service");
const partners_service_1 = require("./partners/partners.service");
const gamification_service_1 = require("./gamification/gamification.service");
const events_gateway_1 = require("../events/events.gateway");
let CrmService = class CrmService {
    constructor(db, // Was Database, now DatabaseService
    urgencyService, partnersService, gamificationService, eventsGateway) {
        this.db = db;
        this.urgencyService = urgencyService;
        this.partnersService = partnersService;
        this.gamificationService = gamificationService;
        this.eventsGateway = eventsGateway;
    }
    async getConversations(tenantId, filters) {
        let query = this.db.client
            .from('crm_conversations')
            .select('*, contact:crm_contacts(*), last_message:crm_messages(content, created_at)')
            .eq('tenant_id', tenantId)
            // Fix: order by last_message_at descending
            .order('last_message_at', { ascending: false });
        if (filters?.urgency) {
            query = query.eq('urgency', filters.urgency);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return data;
    }
    async getConversation(tenantId, id) {
        const { data, error } = await this.db.client
            .from('crm_conversations')
            .select('*, contact:crm_contacts(*), messages:crm_messages(*)')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException('Conversation not found');
        return data;
    }
    async sendMessage(tenantId, conversationId, content, userId) {
        // 1. Create Message (Queued)
        const { data: message, error } = await this.db.client
            .from('crm_messages')
            .insert({
            tenant_id: tenantId,
            conversation_id: conversationId,
            direction: 'OUTBOUND',
            content,
            status: 'QUEUED', // Worker will pick this up
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        // 2. Update Conversation timestamp
        await this.db.client
            .from('crm_conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId);
        // 3. Audit Log
        await this.db.client.from('crm_audit_logs').insert({
            tenant_id: tenantId,
            entity_type: 'MESSAGE',
            entity_id: message.id,
            action: 'MESSAGE_SENT', // Request to send
            actor_id: userId,
            new_value: { content },
        });
        // 4. Real-time Event
        this.eventsGateway.emitNewMessage(tenantId, conversationId, message);
        // 5. Gamification: Award 1 point for sending a message
        if (userId) {
            await this.gamificationService.awardPoints(userId, 1, tenantId);
            // Check achievement: e.g. 100 messages sent
            // For now, assume simple count checks are triggered inside service or here
            // this.gamificationService.checkAchievements(userId, tenantId, 'MESSAGE_COUNT', currentCount);
            // Optimization: Fetch count only if necessary or blindly check.
        }
        return message;
    }
    async handleInbound(tenantId, from, content, providerId) {
        // Idempotency Check
        const { data: existing } = await this.db.client
            .from('crm_messages')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('provider_message_id', providerId)
            .single();
        if (existing)
            return { status: 'ignored', reason: 'idempotency' };
        // Find or Create Contact
        let { data: contact } = await this.db.client
            .from('crm_contacts')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('phone', from)
            .single();
        if (!contact) {
            const { data: newContact } = await this.db.client
                .from('crm_contacts')
                .insert({ tenant_id: tenantId, phone: from, name: from })
                .select()
                .single();
            contact = newContact;
        }
        // Find or Create Conversation
        let { data: conversation } = await this.db.client
            .from('crm_conversations')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('contact_id', contact ? contact.id : '')
            .eq('status', 'OPEN')
            .single();
        if (!conversation) {
            const { data: newConv } = await this.db.client
                .from('crm_conversations')
                .insert({
                tenant_id: tenantId,
                contact_id: contact ? contact.id : '',
                status: 'OPEN',
                urgency: 'NORMAL',
            })
                .select()
                .single();
            conversation = newConv;
        }
        // Check for Referral Consent State
        if (conversation.referral_state === 'WAITING_CONSENT') {
            await this.partnersService.handleConsentResponse(tenantId, conversation.id, content);
            // We still proceed to log the inbound message below
        }
        // Urgency Classification
        const newUrgency = this.urgencyService.classify(content);
        let urgencyUpdated = false;
        // Upgrade urgency if higher (never downgrade automatically here)
        if ((newUrgency === urgency_service_1.UrgencyLevel.PLANTAO && conversation.urgency !== urgency_service_1.UrgencyLevel.PLANTAO) ||
            (newUrgency === urgency_service_1.UrgencyLevel.HIGH && conversation.urgency === urgency_service_1.UrgencyLevel.NORMAL)) {
            await this.db.client
                .from('crm_conversations')
                .update({ urgency: newUrgency })
                .eq('id', conversation.id);
            urgencyUpdated = true;
            // Log Urgency Change
            await this.db.client.from('crm_audit_logs').insert({
                tenant_id: tenantId,
                entity_type: 'CONVERSATION',
                entity_id: conversation.id,
                action: 'URGENCY_CHANGED',
                old_value: { urgency: conversation.urgency },
                new_value: { urgency: newUrgency },
            });
        }
        // Create Message
        const { data: message } = await this.db.client
            .from('crm_messages')
            .insert({
            tenant_id: tenantId,
            conversation_id: conversation.id,
            direction: 'INBOUND',
            content,
            status: 'DELIVERED', // Inbound is already "delivered" to us
            provider_message_id: providerId,
        })
            .select()
            .single();
        // Update Conversation Timestamp
        await this.db.client
            .from('crm_conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversation.id);
        this.eventsGateway.emitNewMessage(tenantId, conversation.id, message);
        return { message, urgencyUpdated, newUrgency };
    }
};
exports.CrmService = CrmService;
exports.CrmService = CrmService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => partners_service_1.PartnersService))),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        urgency_service_1.UrgencyService,
        partners_service_1.PartnersService,
        gamification_service_1.GamificationService,
        events_gateway_1.EventsGateway])
], CrmService);
//# sourceMappingURL=crm.service.js.map