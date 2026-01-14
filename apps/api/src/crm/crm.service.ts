import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UrgencyService, UrgencyLevel } from './urgency.service';
import { PartnersService } from './partners/partners.service';
import { GamificationService } from './gamification/gamification.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class CrmService {
    constructor(
        private readonly db: DatabaseService, // Was Database, now DatabaseService
        private readonly urgencyService: UrgencyService,
        @Inject(forwardRef(() => PartnersService))
        private readonly partnersService: PartnersService,
        private readonly gamificationService: GamificationService,
        private readonly eventsGateway: EventsGateway,
    ) { }

    async getConversations(tenantId: string, filters?: { urgency?: string; status?: string }) {
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
        if (error) throw new Error(error.message);
        return data;
    }

    async getConversation(tenantId: string, id: string) {
        const { data, error } = await this.db.client
            .from('crm_conversations')
            .select('*, contact:crm_contacts(*), messages:crm_messages(*)')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (error) throw new NotFoundException('Conversation not found');
        return data;
    }

    async sendMessage(tenantId: string, conversationId: string, content: string, userId?: string) {
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

        if (error) throw new Error(error.message);

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

    async handleInbound(tenantId: string, from: string, content: string, providerId: string) {
        // Idempotency Check
        const { data: existing } = await this.db.client
            .from('crm_messages')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('provider_message_id', providerId)
            .single();

        if (existing) return { status: 'ignored', reason: 'idempotency' };

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
        if ((conversation as any).referral_state === 'WAITING_CONSENT') {
            await this.partnersService.handleConsentResponse(tenantId, conversation.id, content);
            // We still proceed to log the inbound message below
        }

        // Urgency Classification
        const newUrgency = this.urgencyService.classify(content);
        let urgencyUpdated = false;

        // Upgrade urgency if higher (never downgrade automatically here)
        if (
            (newUrgency === UrgencyLevel.PLANTAO && conversation.urgency !== UrgencyLevel.PLANTAO) ||
            (newUrgency === UrgencyLevel.HIGH && conversation.urgency === UrgencyLevel.NORMAL)
        ) {
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

}
