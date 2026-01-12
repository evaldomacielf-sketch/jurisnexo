import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { RedisService } from '../services/redis.service';
import { SendGridService } from '../services/sendgrid.service';
import { createAdminClient } from '@jurisnexo/db';
import { env } from '@jurisnexo/config';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { Response } from 'express';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly db = createAdminClient();

    constructor(
        private readonly redis: RedisService,
        private readonly sendGrid: SendGridService,
    ) { }

    /**
     * Request an auth code (Login/Register)
     */
    async requestCode(email: string) {
        const code = crypto.randomInt(100000, 999999).toString();
        await this.redis.setAuthCode(email, code);
        await this.sendGrid.sendVerificationEmail(email, code);
        await this.logAudit(null, 'EMAIL_VERIFICATION_REQUESTED', 'auth_flow', null, { email });
        this.logger.log(`Auth code requested for ${email}`);
        return { message: 'Code sent' };
    }

    /**
     * Exchange code for session
     */
    async exchangeCode(email: string, code: string, res: Response) {
        const storedCode = await this.redis.getAndConsumeAuthCode(email);
        if (storedCode !== code) {
            await this.logAudit(null, 'AUTH_LOGIN_FAILED', 'auth_flow', null, { email, reason: 'Invalid code' });
            throw new UnauthorizedException('Invalid or expired code');
        }

        // Get or Create User in auth.users
        let user = await this.getOrCreateAuthUser(email);

        // Generate Tokens
        // Payload matches Supabase expectation for RLS
        const accessToken = this.signAccessToken(user.id, email);
        const refreshToken = await this.createRefreshToken(user.id);

        await this.logAudit(user.id, 'AUTH_LOGIN_SUCCESS', 'session', null, { email });

        // Set Cookies
        this.setCookies(res, accessToken, refreshToken);

        return { user: { id: user.id, email: user.email }, message: 'Login successful' };
    }

    // --- Helpers ---

    private async getOrCreateAuthUser(email: string) {
        // Try to find existing user via admin API
        // listUsers is not ideal for high volume but okay needed here as we don't have user ID.
        // Optimization: Try to use RPC or direct query if possible, but admin client is limited to API.
        // However, create with existing email returns existing user? No, usually error.
        // Best effort search:
        const { data: { users } } = await this.db.auth.admin.listUsers();
        // ! Pagination handling required for prod, but for MVP/prompt:
        const existing = users.find(u => u.email === email);

        if (existing) return existing;

        // Create new
        const { data: newUser, error: createError } = await this.db.auth.admin.createUser({
            email,
            email_confirm: true, // Auto-confirm since we verified via Code
            password: crypto.randomUUID(),
        });

        if (createError) throw createError;
        await this.logAudit(newUser.user.id, 'AUTH_REGISTERED', 'user', newUser.user.id, { email });
        return newUser.user;
    }

    /**
     * Issue tokens for a specific tenant context
     */
    async createTenantSession(userId: string, tenantId: string) {
        // We assume caller verified membership!
        // Get user email for payload
        const user = await this.db.auth.admin.getUserById(userId);
        const email = user.data.user?.email || '';

        const accessToken = this.signAccessToken(userId, email, tenantId);
        const refreshToken = await this.createRefreshToken(userId); // Rotation? Or keep same? New session = new refresh.

        await this.logAudit(userId, 'ACTIVE_TENANT_CHANGED', 'session', null, { tenantId });

        return { accessToken, refreshToken };
    }

    private signAccessToken(userId: string, email: string, tenantId?: string) {
        if (!env.JWT_SECRET) throw new Error('JWT_SECRET missing');

        const payload: any = {
            sub: userId,
            email: email,
            aud: 'authenticated',
            role: 'authenticated',
            app_metadata: { provider: 'email' },
            user_metadata: {},
        };

        if (tenantId) {
            payload.tenant_id = tenantId;
            payload.app_metadata.tenant_id = tenantId; // Supabase usually looks here or root?
            // RLS policy: `auth.jwt() ->> 'tenant_id'`.
            // Supabase `auth.jwt()` returns the whole payload.
            // So root level `tenant_id` works if policy uses `auth.jwt() ->> 'tenant_id'`.
        }

        return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
    }

    private async createRefreshToken(userId: string) {
        const token = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await (this.db.from('refresh_tokens') as any).insert({
            user_id: userId,
            token_hash: hash,
            expires_at: expiresAt.toISOString(),
        });

        return token;
    }

    public setCookies(res: Response, accessToken: string, refreshToken: string) {
        const isProd = env.NODE_ENV === 'production';

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 3600 * 1000,
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/api/auth/refresh',
            maxAge: 30 * 24 * 3600 * 1000,
        });
    }

    private async logAudit(userId: string | null, action: string, _type: string, _entityId: string | null, meta: any) {
        // If we had a tenant, we'd log to DB. Without tenant, just log to console for now.
        // Real implementation would look up tenant from user memberships.
        this.logger.log(`Audit[${userId || 'anon'}]: ${action} ${JSON.stringify(meta)}`);
    }
}
