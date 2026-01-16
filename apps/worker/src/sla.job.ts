import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from './database/database.service';

/*
 * SLA Watchdog
 * Checks for conversations in PLANTAO urgency that haven't been replied to by a human in > 5 minutes.
 */
@Injectable()
export class SlaJob {
  private readonly logger = new Logger(SlaJob.name);

  // eslint-disable-next-line no-unused-vars
  constructor(private readonly _db: DatabaseService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkSlaBreaches() {
    this.logger.debug('Checking SLA breaches...');

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Find conversations:
    // 1. Urgency = PLANTAO
    // 2. Status = OPEN
    // 3. first_human_reply_at IS NULL (no human reply yet)
    // 4. last_message_at < 5 mins ago (stale)
    // 5. Check if we already logged a breach to avoid spamming (using crm_audit_logs check is expensive,
    //    better would be a flag on conversation, but for MVP we query audit logs or assume we optimize later.
    //    For now, simplest: SELECT ids matching criteria)

    const { data: conversations, error } = await this.db.client
      .from('crm_conversations')
      .select('id, tenant_id, urgency, last_message_at')
      .eq('urgency', 'PLANTAO')
      .eq('status', 'OPEN')
      .is('first_human_reply_at', null)
      .lt('last_message_at', fiveMinutesAgo);

    if (error) {
      this.logger.error('Error fetching conversations', error);
      return;
    }

    if (!conversations || conversations.length === 0) return;

    for (const conv of conversations) {
      // Avoid re-alerting: Check if recently alerted?
      // For this MVP, we'll verify if an SLA_BREACH log exists for this conversation in the last hour.
      const { data: existingLog } = await this.db.client
        .from('crm_audit_logs')
        .select('id')
        .eq('entity_id', conv.id)
        .eq('action', 'SLA_BREACH_PLANTAO')
        .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // 1 hour cooldown
        .maybeSingle();

      if (existingLog) continue;

      this.logger.warn(`SLA Breach detected for conversation ${conv.id}`);

      // 1. Log Audit
      await this.db.client.from('crm_audit_logs').insert({
        tenant_id: conv.tenant_id,
        entity_type: 'CONVERSATION',
        entity_id: conv.id,
        action: 'SLA_BREACH_PLANTAO',
        new_value: { reason: 'No human reply > 5m in PLANTAO' },
      });

      // 2. Mock Email to Admin (SendGrid placeholder)
      this.sendAlertEmail(conv.tenant_id, conv.id);
    }
  }

  private async sendAlertEmail(tenantId: string, conversationId: string) {
    // In real app: Fetch tenant admins -> SendGrid
    this.logger.log(
      `[MOCK] Sending Email via SendGrid to admins of tenant ${tenantId}: Alert for Conv ${conversationId}`
    );

    // Log intent to DB if needed for "EMAIL_SENT" audit
    await this.db.client.from('crm_audit_logs').insert({
      tenant_id: tenantId,
      entity_type: 'CONVERSATION',
      entity_id: conversationId,
      action: 'EMAIL_SENT_MOCK',
      new_value: { provider: 'SendGrid', status: 'Sent' },
    });
  }
}
