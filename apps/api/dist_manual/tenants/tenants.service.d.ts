import { AuthService } from '../auth/auth.service';
import { SendGridService } from '../services/sendgrid.service';
export declare class TenantsService {
    private readonly authService;
    private readonly sendGrid;
    private readonly logger;
    private readonly db;
    constructor(authService: AuthService, sendGrid: SendGridService);
    createTenant(userId: string, name: string): Promise<any>;
    getUserTenants(userId: string): Promise<any[]>;
    switchTenant(userId: string, tenantId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    createInvite(tenantId: string, userId: string, email: string, role: string): Promise<{
        message: string;
    }>;
    getInviteByToken(token: string): Promise<{
        email: any;
        role: any;
        tenantName: any;
        status: any;
        expiresAt: any;
        isExpired: boolean;
        isValid: boolean;
        userExists: boolean;
    }>;
    revokeInvite(tenantId: string, userId: string, inviteId: string): Promise<{
        message: string;
    }>;
    listInvites(tenantId: string, userId: string): Promise<any>;
    getTenantMembers(tenantId: string, userId: string): Promise<never[]>;
    acceptInvite(userId: string, token: string): Promise<{
        tenantId: any;
    }>;
    private checkMembership;
    private generateUniqueSlug;
    private logAudit;
    checkTrialExpiration(): Promise<{
        error: any;
        expired?: undefined;
        tenants?: undefined;
    } | {
        expired: number;
        tenants: any[];
        error?: undefined;
    }>;
    getPlanStatus(tenantId: string): Promise<{
        plan: any;
        status: string;
        daysLeft: number;
        features: {
            KEYWORDS_CUSTOM: boolean;
        };
    }>;
    checkFeatureGate(plan: string, feature: string): boolean;
    lookupBySlug(slug: string): Promise<null>;
}
//# sourceMappingURL=tenants.service.d.ts.map