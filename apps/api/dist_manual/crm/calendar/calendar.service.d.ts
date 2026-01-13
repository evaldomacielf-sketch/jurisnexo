import { DatabaseService } from '../../database/database.service';
export declare class CalendarService {
    private readonly db;
    constructor(db: DatabaseService);
    generateAuthUrl(userId: string): Promise<string>;
    connect(userId: string, _code: string): Promise<{
        success: boolean;
    }>;
    scheduleMeeting(tenantId: string, userId: string, data: {
        conversationId: string;
        title: string;
        startTime: string;
        endTime: string;
        mode: 'REMOTE' | 'PRESENCIAL';
    }): Promise<any>;
}
//# sourceMappingURL=calendar.service.d.ts.map