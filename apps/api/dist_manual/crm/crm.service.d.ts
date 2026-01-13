import { DatabaseService } from '../database/database.service';
import { UrgencyService, UrgencyLevel } from './urgency.service';
import { PartnersService } from './partners/partners.service';
import { GamificationService } from './gamification/gamification.service';
import { EventsGateway } from '../events/events.gateway';
export declare class CrmService {
    private readonly db;
    private readonly urgencyService;
    private readonly partnersService;
    private readonly gamificationService;
    private readonly eventsGateway;
    constructor(db: DatabaseService, // Was Database, now DatabaseService
    urgencyService: UrgencyService, partnersService: PartnersService, gamificationService: GamificationService, eventsGateway: EventsGateway);
    getConversations(tenantId: string, filters?: {
        urgency?: string;
        status?: string;
    }): Promise<any[]>;
    getConversation(tenantId: string, id: string): Promise<any>;
    sendMessage(tenantId: string, conversationId: string, content: string, userId?: string): Promise<any>;
    handleInbound(tenantId: string, from: string, content: string, providerId: string): Promise<{
        status: string;
        reason: string;
        message?: undefined;
        urgencyUpdated?: undefined;
        newUrgency?: undefined;
    } | {
        message: any;
        urgencyUpdated: boolean;
        newUrgency: UrgencyLevel;
        status?: undefined;
        reason?: undefined;
    }>;
}
//# sourceMappingURL=crm.service.d.ts.map