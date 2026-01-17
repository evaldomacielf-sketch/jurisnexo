import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from './database/database.service';

/*
 * Message Sender Job
 * Polls crm_messages for status='QUEUED' and "sends" them.
 */
@Injectable()
export class MessageSenderJob {
  private readonly logger = new Logger(MessageSenderJob.name);

  // eslint-disable-next-line no-unused-vars
  constructor(private readonly db: DatabaseService) { }

  @Cron('*/5 * * * * *') // Every 5 seconds
  async processQueue() {
    const { data: messages, error } = await this.db.client
      .from('crm_messages')
      .select('*')
      .eq('status', 'QUEUED')
      .limit(10); // Batch size

    if (error) {
      this.logger.error('Error fetching queued messages', error);
      return;
    }

    if (!messages || messages.length === 0) return;

    this.logger.log(`Processing ${messages.length} outgoing messages...`);

    for (const msg of messages) {
      // Simulate Sending (WhatsApp/Twilio integration would go here)
      await this.simulateDelay(500);

      // Update Status to SENT
      await this.db.client
        .from('crm_messages')
        .update({ status: 'SENT', updated_at: new Date().toISOString() } as any) // Cast to any to avoid strict type checks on partial update implies
        .eq('id', msg.id);

      this.logger.log(`Message ${msg.id} sent successfully.`);
    }
  }

  private simulateDelay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
