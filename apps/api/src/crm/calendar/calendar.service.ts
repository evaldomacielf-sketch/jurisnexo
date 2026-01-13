import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CalendarService {


    constructor(private readonly db: DatabaseService) { }

    // --- OAuth Flow (Simulated) ---

    async generateAuthUrl(userId: string) {
        // In real app: return google.auth.generateAuthUrl(...)
        // Here we return a mock URL that would redirect back to our callback
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=MOCK_CLIENT_ID&redirect_uri=MOCK_CALLBACK&response_type=code&scope=calendar&state=${userId}`;
    }

    async connect(userId: string, _code: string) {
        // In real app: exchange code for tokens via Google API
        const mockTokens = {
            access_token: 'mock_access_token_' + Date.now(),
            refresh_token: 'mock_refresh_token_' + Date.now(),
            expiry_date: new Date(Date.now() + 3600 * 1000).toISOString(),
        };

        // Store Creds
        const { error } = await this.db.client
            .from('crm_oauth_credentials')
            .upsert({
                user_id: userId,
                provider: 'GOOGLE',
                access_token: mockTokens.access_token,
                refresh_token: mockTokens.refresh_token,
                expiry_date: mockTokens.expiry_date,
            }, { onConflict: 'user_id,provider' });

        if (error) throw new Error(error.message);
        return { success: true };
    }

    // --- Meeting Scheduling ---

    async scheduleMeeting(
        tenantId: string,
        userId: string,
        data: { conversationId: string; title: string; startTime: string; endTime: string; mode: 'REMOTE' | 'PRESENCIAL' }
    ) {
        // 1. Create Meeting Record (Status: PENDING)
        const { data: meeting, error } = await this.db.client
            .from('crm_meetings')
            .insert({
                tenant_id: tenantId,
                created_by: userId,
                conversation_id: data.conversationId,
                title: data.title,
                start_time: data.startTime,
                end_time: data.endTime,
                mode: data.mode,
                status: 'PENDING',
                location: data.mode === 'PRESENCIAL' ? 'Escritório Central (Av. Paulista, 1000)' : 'Google Meet (Gerando...)',
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // 2. Audit
        await this.db.client.from('crm_audit_logs').insert({
            tenant_id: tenantId,
            entity_type: 'CONVERSATION',
            entity_id: data.conversationId,
            action: 'MEETING_SCHEDULED',
            new_value: { meeting_id: meeting.id, mode: data.mode }
        });

        // 3. Trigger Worker (The worker will poll PENDING meetings or use queues)
        // For this MVP, we rely on the worker polling 'crm_meetings' with status='PENDING'

        return meeting;
    }
}
