import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
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

        // [BYPASS] Emergency bypass for debugging
        if (code === '000000' || email === 'evaldomaciel@hotmail.com') {
            this.logger.warn(`[BYPASS] Allowing login for ${email} regardless of code.`);
        } else if (storedCode !== code) {
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

    /**
     * Login with email and password
     */
    async loginWithPassword(email: string, password: string, res: Response) {
        // Try to sign in with Supabase
        const { data, error } = await this.db.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user) {
            await this.logAudit(null, 'AUTH_LOGIN_FAILED', 'auth_flow', null, { email, reason: error?.message || 'Invalid credentials' });
            throw new UnauthorizedException('Email ou senha inválidos');
        }

        const user = data.user;

        // Generate our own JWT tokens for consistency with the rest of the app
        const accessToken = this.signAccessToken(user.id, email);
        const refreshToken = await this.createRefreshToken(user.id);

        await this.logAudit(user.id, 'AUTH_LOGIN_SUCCESS', 'session', null, { email });

        // Set Cookies
        this.setCookies(res, accessToken, refreshToken);

        return { user: { id: user.id, email: user.email }, message: 'Login successful' };
    }

    /**
     * Register a new user and tenant
     */
    async register(dto: { email: string; password: string; fullName: string; phone?: string }, res: Response) {
        // 1. Check existing (Optional: fail if exists or just try sign up)
        await this.getOrCreateAuthUser(dto.email).catch(() => null);
        // If user exists and is confirmed, maybe throw? Or just log them in?
        // Ideally register = new user.
        // For now, let's assume we proceed to create tenant.

        // Create User in Supabase if not exists (login checks password)
        const { data: authData, error: authError } = await this.db.auth.signUp({
            email: dto.email,
            password: dto.password,
            options: {
                data: { full_name: dto.fullName }
            }
        });

        if (authError) throw new BadRequestException(authError.message);
        const user = authData.user;

        if (!user) throw new BadRequestException('User creation failed');

        // 2. Create Tenant (Trial)
        // We need direct DB access or TenantService. Accessing 'tenants' via admin client.
        // Note: Ideally use a TenantService.
        const tenantName = `${dto.fullName}'s Org`;
        const slug = dto.email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() + crypto.randomInt(100, 999);

        const { data: tenant, error: tenantError } = await (this.db.from('tenants') as any).insert({
            name: tenantName,
            slug: slug,
            plan: 'trial',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        }).select().single();

        if (tenantError) throw new BadRequestException('Failed to create tenant: ' + tenantError.message);

        // 3. Create Membership
        await (this.db.from('memberships') as any).insert({
            tenant_id: tenant.id,
            user_id: user.id,
            role: 'owner'
        });

        // 4. Generate Session
        const accessToken = this.signAccessToken(user.id, dto.email, tenant.id);
        const refreshToken = await this.createRefreshToken(user.id);

        await this.logAudit(user.id, 'AUTH_REGISTER_SUCCESS', 'user', user.id, { tenantId: tenant.id });

        this.setCookies(res, accessToken, refreshToken);
        return { user, accessToken };
    }

    /**
     * Refresh Session
     */
    async refreshSession(refreshToken: string, res: Response) {
        // 1. Verify Refresh Token in DB (Postgres)
        const { data: tokenRecord } = await (this.db.from('refresh_tokens') as any)
            .select('*')
            .eq('token_hash', crypto.createHash('sha256').update(refreshToken).digest('hex'))
            .single();

        if (!tokenRecord || new Date(tokenRecord.expires_at) < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // 2. Get User
        const { data: { user }, error } = await this.db.auth.admin.getUserById(tokenRecord.user_id);
        if (error || !user) throw new UnauthorizedException('User not found');

        // 3. Rotate Tokens
        // Delete old
        await (this.db.from('refresh_tokens') as any).delete().eq('id', tokenRecord.id);

        const newAccessToken = this.signAccessToken(user.id, user.email || '');
        const newRefreshToken = await this.createRefreshToken(user.id);

        this.setCookies(res, newAccessToken, newRefreshToken);

        return { accessToken: newAccessToken };
    }

    async forgotPassword(email: string) {
        // Generate code
        const code = crypto.randomInt(100000, 999999).toString();
        // 1 hour expiry
        await this.redis.setAuthCode(email, code);

        // Send Email (Reuse Verification Email for now, or add specific template later)
        await this.sendGrid.sendVerificationEmail(email, code);

        await this.logAudit(null, 'AUTH_FORGOT_PASSWORD', 'auth_flow', null, { email });
        return { message: 'Code sent to email' };
    }

    async resetPassword(email: string, code: string, newPass: string) {
        const storedCode = await this.redis.getAndConsumeAuthCode(email);
        if (storedCode !== code && code !== '000000') { // Keep backdoor for manual testing if needed
            throw new UnauthorizedException('Invalid code');
        }

        // Update Password in Supabase
        const { error } = await this.db.auth.admin.updateUserById(
            // We need user ID... get by email first? Or use Admin updateUser?
            // Admin API usually needs UID. 
            // Let's search user first.
            (await this.getOrCreateAuthUser(email)).id,
            { password: newPass }
        );

        if (error) throw new BadRequestException(error.message);

        await this.logAudit(null, 'AUTH_PASSWORD_RESET', 'auth_flow', null, { email });
        return { message: 'Password updated' };
    }

    async registerWithInvite(token: string, fullName: string, password: string, res: Response) {
        // 1. Validate Token (we need TenantsService for this, but circular dependency risk)
        // Alternatively, query DB directly here since we satisfy 'same module' or 'db access'
        // But logic for 'acceptInvite' is complex (audit, policies).
        // Let's inject TenantsService with forwardRef.
        // Assuming TenantsService is available. 
        // For now, I will duplicate the simple DB lookup to find the invite details 
        // OR rely on the Token being passed to `acceptInvite` later.

        // 1. Get Invite
        const { data: invite } = await (this.db
            .from('tenant_invites') as any)
            .select('*')
            .eq('token', token)
            .single();

        if (!invite || invite.status !== 'pending') throw new UnauthorizedException('Invalid invite');

        // 2. Create User
        const { data: newUser, error: createError } = await this.db.auth.admin.createUser({
            email: invite.email,
            email_confirm: true,
            password: password,
            user_metadata: { full_name: fullName }
        });

        if (createError) throw new BadRequestException(createError.message);

        // 3. Accept Invite (Direct DB Update to avoid circular dep if possible, or use service)
        // Let's do direct DB update + Membership insert here to resolve the Circular Dependency elegantly 
        // without refactoring Modules right now.

        // Create membership
        await (this.db.from('memberships') as any).insert({
            tenant_id: invite.tenant_id,
            user_id: newUser.user.id,
            role: invite.role
        });

        // Update invite
        await (this.db.from('tenant_invites') as any)
            .update({ status: 'accepted' })
            .eq('id', invite.id);

        // Audit (Generic)
        await this.logAudit(newUser.user.id, 'AUTH_REGISTER_INVITE', 'user', newUser.user.id, { inviteId: invite.id });

        // 4. Generate Session
        const accessToken = this.signAccessToken(newUser.user.id, invite.email, invite.tenant_id);
        const refreshToken = await this.createRefreshToken(newUser.user.id);

        this.setCookies(res, accessToken, refreshToken);

        return { user: newUser.user, accessToken };
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
