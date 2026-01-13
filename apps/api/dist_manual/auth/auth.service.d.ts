import { RedisService } from '../services/redis.service';
import { SendGridService } from '../services/sendgrid.service';
import { Response } from 'express';
export declare class AuthService {
    private readonly redis;
    private readonly sendGrid;
    private readonly logger;
    private readonly db;
    constructor(redis: RedisService, sendGrid: SendGridService);
    /**
     * Request an auth code (Login/Register)
     */
    requestCode(email: string): Promise<{
        message: string;
    }>;
    /**
     * Exchange code for session
     */
    exchangeCode(email: string, code: string, res: Response): Promise<{
        user: {
            id: string;
            email: string | undefined;
        };
        message: string;
    }>;
    registerWithInvite(token: string, fullName: string, password: string, res: Response): Promise<{
        user: import("@supabase/supabase-js").AuthUser;
        accessToken: string;
    }>;
    private getOrCreateAuthUser;
    /**
     * Issue tokens for a specific tenant context
     */
    createTenantSession(userId: string, tenantId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private signAccessToken;
    private createRefreshToken;
    setCookies(res: Response, accessToken: string, refreshToken: string): void;
    private logAudit;
}
//# sourceMappingURL=auth.service.d.ts.map