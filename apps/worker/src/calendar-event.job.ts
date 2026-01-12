import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from './database/database.service';

@Injectable()
export class CalendarEventJob {
    private readonly logger = new Logger(CalendarEventJob.name);

    constructor(private readonly db: DatabaseService) { }

    @Cron('*/10 * * * * *') // Every 10 seconds for demo responsiveness
    async processPendingMeetings() {
        // 1. Fetch PENDING meetings
        const { data: meetings, error } = await this.db.client
            .from('crm_meetings')
            .select('*, conversation:crm_conversations(contact:crm_contacts(name, phone))')
            .eq('status', 'PENDING')
            .limit(5);

        if (error) {
            this.logger.error('Error fetching pending meetings', error);
            return;
        }

        if (!meetings || meetings.length === 0) return;

        this.logger.log(\`Processing \${meetings.length} pending meetings...\`);

    for (const meeting of meetings) {
      try {
        // 2. Simulate Google Calendar API Call
        // In real app: use stored Oauth tokens to call Google Calendar API
        
        await this.simulateDelay(1000);

        const googleEventId = 'evt_' + Math.random().toString(36).substring(7);
        let meetLink = meeting.meet_link;
        if (meeting.mode === 'REMOTE') {
            meetLink = 'https://meet.google.com/abc-' + Math.random().toString(36).substring(7);
        }

        // 3. Update Meeting
        const { error: updateError } = await this.db.client
            .from('crm_meetings')
            .update({
                status: 'CONFIRMED',
                google_event_id: googleEventId,
                meet_link: meetLink,
                updated_at: new Date().toISOString()
            } as any)
            .eq('id', meeting.id);

        if (updateError) throw new Error(updateError.message);

        // 4. Send Confirmation Message (WhatsApp)
        let messageContent = \`Agendamento Confirmado! ✅\n\n📅 \${new Date(meeting.start_time).toLocaleString()}\n📍 \${meeting.mode}: \${meeting.location}\`;
        
        if (meetLink) {
            messageContent += \`\n🔗 Link: \${meetLink}\`;
        }

        await this.db.client.from('crm_messages').insert({
            tenant_id: meeting.tenant_id,
            conversation_id: meeting.conversation_id,
            direction: 'OUTBOUND',
            content: messageContent,
            status: 'QUEUED'
        });

        // 5. Audit
        await this.db.client.from('crm_audit_logs').insert({
            tenant_id: meeting.tenant_id,
            entity_type: 'MEETING',
            entity_id: meeting.id,
            action: 'CALENDAR_EVENT_CREATED',
            new_value: { google_event_id: googleEventId }
        });

        this.logger.log(\`Meeting \${meeting.id} confirmed and event created.\`);

      } catch (err) {
        this.logger.error(\`Failed to process meeting \${meeting.id}\`, err);
        // Update status to FAILED or retry count
      }
    }
  }

  private simulateDelay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
