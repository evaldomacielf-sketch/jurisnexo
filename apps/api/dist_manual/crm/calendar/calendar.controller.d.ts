import { CalendarService } from './calendar.service';
export declare class CalendarController {
    private readonly calendarService;
    constructor(calendarService: CalendarService);
    connect(req: any): Promise<string>;
    callback(req: any, code: string): Promise<{
        success: boolean;
    }>;
    schedule(req: any, body: {
        conversationId: string;
        title: string;
        startTime: string;
        endTime: string;
        mode: 'REMOTE' | 'PRESENCIAL';
    }): Promise<any>;
}
//# sourceMappingURL=calendar.controller.d.ts.map