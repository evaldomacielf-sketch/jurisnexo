import { DatabaseService } from '../database/database.service';
export declare class SuperadminService {
    private readonly db;
    constructor(db: DatabaseService);
    checkIsSuperadmin(userId: string): Promise<boolean>;
    listTenants(): Promise<any[]>;
    getGlobalAuditLogs(): Promise<any[]>;
    disableTenant(adminUserId: string, tenantId: string, reason: string): Promise<void>;
}
//# sourceMappingURL=superadmin.service.d.ts.map