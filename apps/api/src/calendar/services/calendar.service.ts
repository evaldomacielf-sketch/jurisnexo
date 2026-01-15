import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
    CreateEventDto,
    UpdateEventDto,
    EventResponseDto,
    EventType,
} from '../dto/calendar.dto';
import { GoogleCalendarService } from './google-calendar.service';

@Injectable()
export class CalendarService {
    private readonly logger = new Logger(CalendarService.name);

    constructor(
        private readonly database: DatabaseService,
        private readonly googleCalendar: GoogleCalendarService,
    ) { }

    /**
     * Create calendar event
     */
    async create(tenantId: string, userId: string, dto: CreateEventDto): Promise<EventResponseDto> {
        const eventData: any = {
            tenant_id: tenantId,
            created_by: userId,
            title: dto.title,
            description: dto.description,
            type: dto.type,
            start_date: dto.startDate,
            end_date: dto.endDate,
            all_day: dto.allDay || false,
            location: dto.location,
            video_link: dto.videoLink,
            case_id: dto.caseId,
            client_id: dto.clientId,
            participant_ids: dto.participantIds || [],
            reminders: dto.reminders || [],
            recurrence: dto.recurrence,
            color: dto.color,
        };

        const { data, error } = await this.database.client
            .from('calendar_events')
            .insert(eventData)
            .select()
            .single();

        if (error) throw error;

        // Sync with Google Calendar if requested
        if (dto.syncWithGoogle) {
            try {
                const googleEventId = await this.googleCalendar.createEvent(userId, data);
                await this.database.client
                    .from('calendar_events')
                    .update({ google_event_id: googleEventId })
                    .eq('id', data.id);
                data.google_event_id = googleEventId;
            } catch (err) {
                this.logger.error('Failed to sync with Google Calendar', err);
            }
        }

        this.logger.log(`Event created: ${data.id}`);
        return this.mapToResponse(data);
    }

    /**
     * Get events for date range
     */
    async getEvents(
        tenantId: string,
        userId: string,
        startDate: string,
        endDate: string,
        options?: { type?: EventType; caseId?: string; clientId?: string },
    ): Promise<EventResponseDto[]> {
        let query = this.database.client
            .from('calendar_events')
            .select('*')
            .eq('tenant_id', tenantId)
            .gte('start_date', startDate)
            .lte('end_date', endDate)
            .order('start_date', { ascending: true });

        if (options?.type) {
            query = query.eq('type', options.type);
        }
        if (options?.caseId) {
            query = query.eq('case_id', options.caseId);
        }
        if (options?.clientId) {
            query = query.eq('client_id', options.clientId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(this.mapToResponse);
    }

    /**
     * Get single event
     */
    async getById(id: string): Promise<EventResponseDto> {
        const { data, error } = await this.database.client
            .from('calendar_events')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) throw new NotFoundException('Evento não encontrado');
        return this.mapToResponse(data);
    }

    /**
     * Update event
     */
    async update(id: string, dto: UpdateEventDto, syncGoogle = false): Promise<EventResponseDto> {
        const updateData: any = { updated_at: new Date() };

        if (dto.title) updateData.title = dto.title;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.type) updateData.type = dto.type;
        if (dto.startDate) updateData.start_date = dto.startDate;
        if (dto.endDate) updateData.end_date = dto.endDate;
        if (dto.allDay !== undefined) updateData.all_day = dto.allDay;
        if (dto.location !== undefined) updateData.location = dto.location;
        if (dto.videoLink !== undefined) updateData.video_link = dto.videoLink;
        if (dto.participantIds) updateData.participant_ids = dto.participantIds;
        if (dto.reminders) updateData.reminders = dto.reminders;
        if (dto.color) updateData.color = dto.color;

        const { data, error } = await this.database.client
            .from('calendar_events')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Sync update with Google
        if (syncGoogle && data.google_event_id) {
            try {
                await this.googleCalendar.updateEvent(data.created_by, data.google_event_id, data);
            } catch (err) {
                this.logger.error('Failed to update Google Calendar event', err);
            }
        }

        return this.mapToResponse(data);
    }

    /**
     * Delete event
     */
    async delete(id: string): Promise<void> {
        const event = await this.getById(id);

        // Delete from Google Calendar
        if (event.googleEventId) {
            try {
                await this.googleCalendar.deleteEvent(event.googleEventId);
            } catch (err) {
                this.logger.error('Failed to delete Google Calendar event', err);
            }
        }

        await this.database.client
            .from('calendar_events')
            .delete()
            .eq('id', id);
    }

    /**
     * Get upcoming events (for dashboard)
     */
    async getUpcoming(tenantId: string, userId: string, limit = 5): Promise<EventResponseDto[]> {
        const now = new Date().toISOString();
        const { data, error } = await this.database.client
            .from('calendar_events')
            .select('*')
            .eq('tenant_id', tenantId)
            .gte('start_date', now)
            .order('start_date', { ascending: true })
            .limit(limit);

        if (error) throw error;
        return (data || []).map(this.mapToResponse);
    }

    /**
     * Get events by type (for reports)
     */
    async getEventsByType(tenantId: string, startDate: string, endDate: string) {
        const { data, error } = await this.database.client
            .from('calendar_events')
            .select('type')
            .eq('tenant_id', tenantId)
            .gte('start_date', startDate)
            .lte('end_date', endDate);

        if (error) throw error;

        // Group by type
        const counts: Record<string, number> = {};
        (data || []).forEach((e: any) => {
            counts[e.type] = (counts[e.type] || 0) + 1;
        });

        return counts;
    }

    private mapToResponse(row: any): EventResponseDto {
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            type: row.type,
            startDate: row.start_date,
            endDate: row.end_date,
            allDay: row.all_day,
            location: row.location,
            videoLink: row.video_link,
            caseId: row.case_id,
            clientId: row.client_id,
            participantIds: row.participant_ids || [],
            reminders: row.reminders || [],
            recurrence: row.recurrence,
            color: row.color,
            googleEventId: row.google_event_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
