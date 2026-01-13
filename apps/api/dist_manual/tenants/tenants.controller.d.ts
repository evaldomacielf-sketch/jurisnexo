import { Response } from 'express';
import { TenantsService } from './tenants.service';
import { AuthService } from '../auth/auth.service';
export declare class TenantsController {
    private readonly tenantsService;
    private readonly authService;
    constructor(tenantsService: TenantsService, authService: AuthService);
    create(name: string, req: any): Promise<any>;
    listMe(req: any): Promise<any[]>;
    switchTenant(tenantId: string, req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    listMembers(req: any): Promise<never[]>;
    listInvites(req: any): Promise<any>;
    createInvite(body: {
        email: string;
        role: string;
    }, req: any): Promise<{
        message: string;
    }>;
    revokeInvite(id: string, req: any): Promise<{
        message: string;
    }>;
    getInvite(token: string): Promise<{
        email: any;
        role: any;
        tenantName: any;
        status: any;
        expiresAt: any;
        isExpired: boolean;
        isValid: boolean;
        userExists: boolean;
    }>;
    acceptInvite(token: string, req: any): Promise<{
        tenantId: any;
    }>;
    getPlan(req: any): Promise<{
        plan: any;
        status: string;
        daysLeft: number;
        features: {
            KEYWORDS_CUSTOM: boolean;
        };
    }>;
    expireTrials(): Promise<{
        error: any;
        expired?: undefined;
        tenants?: undefined;
    } | {
        expired: number;
        tenants: any[];
        error?: undefined;
    }>;
    lookupBySlug(slug: string): Promise<never>;
}
//# sourceMappingURL=tenants.controller.d.ts.map