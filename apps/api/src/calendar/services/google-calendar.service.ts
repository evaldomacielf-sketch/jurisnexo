import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../database/supabase.service';

interface GoogleTokens {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
}

@Injectable()
export class GoogleCalendarService {
    private readonly logger = new Logger(GoogleCalendarService.name);
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly supabase: SupabaseService,
    ) {
        this.clientId = this.configService.get('GOOGLE_CLIENT_ID') || '';
        this.clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET') || '';
        this.redirectUri = this.configService.get('GOOGLE_REDIRECT_URI') || '';
    }

    /**
     * Get OAuth2 authorization URL
     */
    getAuthUrl(userId: string): string {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
        ];

        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: scopes.join(' '),
            access_type: 'offline',
            prompt: 'consent',
            state: userId,
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    /**
     * Exchange authorization code for tokens
     */
    async handleCallback(code: string, userId: string): Promise<void> {
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: this.redirectUri,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to exchange code for tokens');
            }

            const tokens = await response.json();

            // Store tokens
            await this.supabase.client
                .from('user_integrations')
                .upsert({
                    user_id: userId,
                    provider: 'google_calendar',
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expiry_date: Date.now() + (tokens.expires_in * 1000),
                    updated_at: new Date(),
                });

            this.logger.log(`Google Calendar connected for user ${userId}`);
        } catch (error) {
            this.logger.error('Failed to connect Google Calendar', error);
            throw error;
        }
    }

    /**
     * Create event in Google Calendar
     */
    async createEvent(userId: string, event: any): Promise<string> {
        const tokens = await this.getValidTokens(userId);
        if (!tokens) throw new Error('User not connected to Google Calendar');

        const googleEvent = this.mapToGoogleEvent(event);

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(googleEvent),
        });

        if (!response.ok) {
            throw new Error('Failed to create Google Calendar event');
        }

        const createdEvent = await response.json();
        return createdEvent.id;
    }

    /**
     * Update event in Google Calendar
     */
    async updateEvent(userId: string, googleEventId: string, event: any): Promise<void> {
        const tokens = await this.getValidTokens(userId);
        if (!tokens) throw new Error('User not connected to Google Calendar');

        const googleEvent = this.mapToGoogleEvent(event);

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${tokens.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(googleEvent),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to update Google Calendar event');
        }
    }

    /**
     * Delete event from Google Calendar
     */
    async deleteEvent(googleEventId: string): Promise<void> {
        // Note: This needs userId, simplified for now
        this.logger.log(`Would delete Google event: ${googleEventId}`);
    }

    /**
     * Sync events from Google Calendar
     */
    async syncEvents(userId: string, startDate: string, endDate: string): Promise<any[]> {
        const tokens = await this.getValidTokens(userId);
        if (!tokens) throw new Error('User not connected to Google Calendar');

        const params = new URLSearchParams({
            timeMin: new Date(startDate).toISOString(),
            timeMax: new Date(endDate).toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime',
        });

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${tokens.access_token}`,
                },
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Google Calendar events');
        }

        const data = await response.json();
        return data.items || [];
    }

    /**
     * Check if user is connected
     */
    async isConnected(userId: string): Promise<boolean> {
        const { data } = await this.supabase.client
            .from('user_integrations')
            .select('id')
            .eq('user_id', userId)
            .eq('provider', 'google_calendar')
            .single();

        return !!data;
    }

    /**
     * Disconnect Google Calendar
     */
    async disconnect(userId: string): Promise<void> {
        await this.supabase.client
            .from('user_integrations')
            .delete()
            .eq('user_id', userId)
            .eq('provider', 'google_calendar');

        this.logger.log(`Google Calendar disconnected for user ${userId}`);
    }

    /**
     * Get valid tokens (refresh if needed)
     */
    private async getValidTokens(userId: string): Promise<GoogleTokens | null> {
        const { data } = await this.supabase.client
            .from('user_integrations')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', 'google_calendar')
            .single();

        if (!data) return null;

        // Check if token needs refresh
        if (data.expiry_date < Date.now()) {
            return this.refreshTokens(userId, data.refresh_token);
        }

        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expiry_date: data.expiry_date,
        };
    }

    /**
     * Refresh access token
     */
    private async refreshTokens(userId: string, refreshToken: string): Promise<GoogleTokens | null> {
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token',
                }),
            });

            if (!response.ok) return null;

            const tokens = await response.json();

            await this.supabase.client
                .from('user_integrations')
                .update({
                    access_token: tokens.access_token,
                    expiry_date: Date.now() + (tokens.expires_in * 1000),
                    updated_at: new Date(),
                })
                .eq('user_id', userId)
                .eq('provider', 'google_calendar');

            return {
                access_token: tokens.access_token,
                refresh_token: refreshToken,
                expiry_date: Date.now() + (tokens.expires_in * 1000),
            };
        } catch {
            return null;
        }
    }

    /**
     * Map local event to Google Calendar format
     */
    private mapToGoogleEvent(event: any): any {
        const googleEvent: any = {
            summary: event.title,
            description: event.description,
            location: event.location,
        };

        if (event.all_day) {
            googleEvent.start = { date: event.start_date.split('T')[0] };
            googleEvent.end = { date: event.end_date.split('T')[0] };
        } else {
            googleEvent.start = { dateTime: event.start_date, timeZone: 'America/Sao_Paulo' };
            googleEvent.end = { dateTime: event.end_date, timeZone: 'America/Sao_Paulo' };
        }

        if (event.video_link) {
            googleEvent.conferenceData = {
                entryPoints: [{ uri: event.video_link, entryPointType: 'video' }],
            };
        }

        return googleEvent;
    }
}
