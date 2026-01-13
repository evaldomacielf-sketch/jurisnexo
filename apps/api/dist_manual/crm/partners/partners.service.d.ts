import { DatabaseService } from '../../database/database.service';
import { CrmService } from '../crm.service';
export declare class PartnersService {
    private readonly db;
    private readonly crmService;
    private readonly logger;
    constructor(db: DatabaseService, crmService: CrmService);
    createPartner(tenantId: string, data: {
        name: string;
        phone: string;
        email: string;
        areas: string[];
    }): Promise<any>;
    listPartners(tenantId: string): Promise<any[]>;
    findBestPartner(tenantId: string, area: string): Promise<any>;
    requestConsent(tenantId: string, conversationId: string): Promise<void>;
    handleConsentResponse(tenantId: string, conversationId: string, content: string): Promise<void>;
    private executeReferral;
    private handleRefusal;
}
//# sourceMappingURL=partners.service.d.ts.map