import { SuperadminService } from './superadmin.service';
export declare class SuperadminController {
    private readonly superadminService;
    constructor(superadminService: SuperadminService);
    listTenants(req: any): Promise<any[]>;
    getAuditLogs(req: any): Promise<any[]>;
    disableTenant(req: any, id: string, reason: string): Promise<void>;
}
//# sourceMappingURL=superadmin.controller.d.ts.map