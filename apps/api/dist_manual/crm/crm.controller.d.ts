import { CrmService } from './crm.service';
export declare class CrmController {
    private readonly crmService;
    constructor(crmService: CrmService);
    getConversations(req: any, query: any): Promise<any[]>;
    getConversation(req: any, id: string): Promise<any>;
    sendMessage(req: any, id: string, content: string): Promise<any>;
    handleInbound(body: any): Promise<{
        status: string;
        reason: string;
        message?: undefined;
        urgencyUpdated?: undefined;
        newUrgency?: undefined;
    } | {
        message: any;
        urgencyUpdated: boolean;
        newUrgency: import("./urgency.service").UrgencyLevel;
        status?: undefined;
        reason?: undefined;
    }>;
}
//# sourceMappingURL=crm.controller.d.ts.map