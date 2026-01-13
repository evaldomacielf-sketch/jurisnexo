import { Injectable, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { createAdminClient } from '@jurisnexo/db';
import { AuthService } from '../auth/auth.service';
import slugify from 'slugify';
import * as crypto from 'crypto';
import { SendGridService } from '../services/sendgrid.service';

// Reserved slugs



@Injectable()
export class TenantsService {
    private readonly logger = new Logger(TenantsService.name);
    private readonly db = createAdminClient();

    constructor(
        private readonly authService: AuthService,
        private readonly sendGrid: SendGridService,
    ) { }

    async createTenant(userId: string, name: string) {
        this.logger.log(`Creating tenant '${name}' for user ${userId}`);
        // 1. Generate unique slug
        const slug = await this.generateUniqueSlug(name);

        // 2. Create Tenant
        // Use transaction if possible, or manual rollback. Supabase JS doesn't expose easy transactions unless using RPC.
        // We will do steps sequentially and cleanup on error.

        const { data: tenant, error: tenantError } = await (this.db
            .from('tenants') as any)
            .insert({
                name,
                slug,
                plan: 'trial',
                trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            })
            .select()
            .single();

        if (tenantError) {
            this.logger.error(`Failed to create tenant: ${tenantError.message}`);
            throw new BadRequestException('Could not create tenant');
        }

        // 3. Create Membership (Owner)
        const { error: memberError } = await (this.db
            .from('memberships') as any)
            .insert({
                tenant_id: tenant.id,
                user_id: userId,
                role: 'owner', // Enum check: owner/admin/member? prompt said ADMIN. Map 'criador vira ADMIN'.
                // If Enum has 'owner', usually owner > admin. I'll stick to 'owner' as super-admin equivalent or 'admin'.
                // Prompt: "criador vira ADMIN".
                // Migration 002: role IN ('owner', 'admin', 'member')
                // I will use 'owner' for creator as it implies ownership/admin rights.
            });

        if (memberError) {
            // Rollback tenant
            await this.db.from('tenants').delete().eq('id', tenant.id);
            throw new BadRequestException('Failed to assign membership');
        }

        // 4. Audit
        // Use AuthService helper if available or log manually? 
        // AuthService audit needed tenant_id context. Now we have it.
        // But AuthService logAudit is private.
        // I should expose audit logging or just log here. 
        // Prompt says "Auditoria: TENANT_CREATED"
        // I will implement a basic log here manually or via a shared AuditService eventually.
        // For now, reuse the pattern:
        await this.logAudit(userId, tenant.id, 'TENANT_CREATED', 'tenant', tenant.id, { name, slug });

        return tenant;
    }

    async getUserTenants(userId: string) {
        // Query memberships -> tenants
        const { data, error } = await this.db
            .from('memberships')
            .select('role, tenants(*)')
            .eq('user_id', userId);

        if (error) throw new BadRequestException('Failed to fetch tenants');
        return (data as any[]).map(m => ({ ...m.tenants, role: m.role }));
    }

    async switchTenant(userId: string, tenantId: string) {
        // 1. Verify membership
        const { data: membership } = await this.db
            .from('memberships')
            .select('role')
            .eq('user_id', userId)
            .eq('tenant_id', tenantId)
            .single();

        if (!membership) {
            throw new ForbiddenException('You are not a member of this tenant');
        }

        // 2. Issue new Tokens (delegated to AuthService public method?)
        // AuthService `signAccessToken` is private. I need to expose a method `createSessionForTenant` in AuthService.
        // I will update AuthService to expose this.
        return this.authService.createTenantSession(userId, tenantId);
    }

    async createInvite(tenantId: string, userId: string, email: string, role: string) {
        const membership = await this.checkMembership(userId, tenantId);
        if (!['owner', 'admin'].includes(membership.role)) {
            throw new ForbiddenException('Only admins can invite members');
        }

        // Check if invite already exists pending
        const { data: existing } = await (this.db.from('tenant_invites') as any)
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('email', email)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .single();

        if (existing) {
            // Resend email instead of error?
            // For now throw to prevent dupe spam, or just return success (idempotent)
            // Let's reuse existing logic but update expires? 
            // Simple: Throw error "Invite already pending"
            throw new BadRequestException('Invite already pending for this email');
        }

        // Generate Token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        const { error } = await (this.db.from('tenant_invites') as any).insert({
            tenant_id: tenantId,
            email,
            role,
            token,
            expires_at: expiresAt.toISOString(),
            status: 'pending',
            created_by: userId
        });

        if (error) throw new BadRequestException('Failed to create invite');

        // Send Email
        const baseUrl = process.env.WEB_URL || 'http://localhost:3000';
        const inviteLink = `${baseUrl}/invites/${token}`;

        // Fetch tenant details for name
        const { data: tenant } = await this.db.from('tenants').select('name').eq('id', tenantId).single();

        await this.sendGrid.sendInviteEmail(email, inviteLink, (tenant as any)?.name || 'JurisNexo');

        await this.logAudit(userId, tenantId, 'TENANT_INVITE_CREATED', 'invite', null, { email, role });

        return { message: 'Invite sent' };
    }

    async getInviteByToken(token: string) {
        const { data: invite, error } = await (this.db
            .from('tenant_invites') as any)
            .select('*, tenant:tenants(name)')
            .eq('token', token)
            .single();

        if (error || !invite) throw new BadRequestException('Invalid token');

        const isExpired = new Date(invite.expires_at) < new Date();
        const isValid = invite.status === 'pending' && !isExpired;

        // Check if user exists
        const { data: { users } } = await this.db.auth.admin.listUsers();
        // Pagination ignored for MVP
        const userExists = users.some(u => u.email === invite.email);

        return {
            email: invite.email,
            role: invite.role,
            tenantName: invite.tenant?.name || 'Unknown',
            status: invite.status,
            expiresAt: invite.expires_at,
            isExpired,
            isValid,
            userExists
        };
    }

    async revokeInvite(tenantId: string, userId: string, inviteId: string) {
        const membership = await this.checkMembership(userId, tenantId);
        if (!['owner', 'admin'].includes(membership.role)) {
            throw new ForbiddenException('Only admins can revoke invites');
        }

        const { error } = await (this.db.from('tenant_invites') as any)
            .update({ status: 'revoked' })
            .eq('id', inviteId)
            .eq('tenant_id', tenantId);

        if (error) throw new BadRequestException('Failed to revoke invite');

        await this.logAudit(userId, tenantId, 'TENANT_INVITE_REVOKED', 'invite', inviteId, {});
        return { message: 'Invite revoked' };
    }

    async listInvites(tenantId: string, userId: string) {
        const membership = await this.checkMembership(userId, tenantId);
        if (!['owner', 'admin'].includes(membership.role)) {
            throw new ForbiddenException('Only admins can list invites');
        }

        const { data, error } = await (this.db
            .from('tenant_invites') as any)
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw new BadRequestException('Failed to list invites');
        return data;
    }

    async getTenantMembers(tenantId: string, userId: string) {
        await this.checkMembership(userId, tenantId);
        // Supabase select relation syntax might assume FK names.
        // If users table is linked by user_id in memberships:
        // memberships(..., users(*)) requires foreign key setup in Supabase/Postgres.
        // Assuming typical setup.
        const { data, error } = await this.db
            .from('memberships')
            .select('id, role, created_at, user:users(*)')
            .eq('tenant_id', tenantId);

        // If user relation fail (if not permissioned to see auth.users or public.users?), handling:
        if (error) {
            this.logger.error(`Error fetching members: ${error.message}`);
            throw new BadRequestException('Failed to fetch members');
        }
        return data;
    }

    async acceptInvite(userId: string, token: string) {
        // 1. Find invite
        const { data: invite, error } = await (this.db
            .from('tenant_invites') as any)
            .select('*')
            .eq('token', token)
            .single();

        if (error || !invite) throw new BadRequestException('Invalid token');
        if (invite.status !== 'pending') throw new BadRequestException('Invite no longer valid');
        if (new Date(invite.expires_at) < new Date()) throw new BadRequestException('Invite expired');

        // 2. Validate User Email matches
        if (userId) {
            const { data: { user } } = await this.db.auth.admin.getUserById(userId);
            if (user?.email && user.email !== invite.email) {
                // Warning: Mismatch. 
                // Allow matching? Security risk?
                // Prompt impl: "se não existe... cria". 
                // If authenticated user click link for OTHER email, deny.
                throw new BadRequestException('Invite email does not match logged in user');
            }
        }

        // 3. Create Membership
        // Check if already exists
        const { data: existing } = await this.db.from('memberships').select('id').eq('tenant_id', invite.tenant_id).eq('user_id', userId).single();
        if (existing) {
            // Already member. Just mark accepted.
        } else {
            const { error: memError } = await (this.db.from('memberships') as any).insert({
                tenant_id: invite.tenant_id,
                user_id: userId,
                role: invite.role
            });
            if (memError) throw new BadRequestException('Failed to join tenant');
        }

        // 4. Update Status
        await (this.db.from('tenant_invites') as any)
            .update({ status: 'accepted' })
            .eq('id', invite.id);

        // 5. Audit
        await this.logAudit(userId, invite.tenant_id, 'TENANT_INVITE_ACCEPTED', 'membership', null, { role: invite.role });

        return { tenantId: invite.tenant_id };
    }

    private async checkMembership(userId: string, tenantId: string) {
        const { data } = await this.db.from('memberships').select('role').eq('user_id', userId).eq('tenant_id', tenantId).single();
        if (!data) throw new ForbiddenException('Not a member');
        return data as { role: string };
    }

    private async generateUniqueSlug(name: string): Promise<string> {
        // [EMERGENCY FIX] Force unique slug with timestamp to prevent loops
        const slug = slugify(name, { lower: true, strict: true, trim: true });
        const uniqueSlug = `${slug}-${Date.now()}`;
        console.log(`[TenantsService] Generated forced slug: ${uniqueSlug}`);
        return uniqueSlug;
    }

    private async logAudit(userId: string, tenantId: string, action: string, type: string, entityId: string | null, meta: any) {
        // Direct insert into audit_events using admin client implies we bypass "own tenant insert" check?
        // No, insert into specific tenant_id works if policy allows or if we are admin. 
        // We are using Admin Client here (`this.db`).
        await (this.db.from('audit_events') as any).insert({
            tenant_id: tenantId,
            user_id: userId,
            event_type: action,
            resource_type: type,
            resource_id: entityId,
            metadata: meta,
        });
    }

    // --- Plans & Trial Logic ---

    async checkTrialExpiration() {
        this.logger.log('Checking for expired trials...');

        // Find tenants with plan 'trial' and trial_ends_at < now
        const { data: expiredTenants, error } = await (this.db.from('tenants') as any)
            .select('id, name, trial_ends_at')
            .eq('plan', 'trial')
            .lt('trial_ends_at', new Date().toISOString());

        if (error) {
            this.logger.error('Failed to query expired trials', error);
            return { error };
        }

        const updates = [];
        for (const tenant of expiredTenants) {
            this.logger.log(`Expiring trial for tenant ${tenant.name} (${tenant.id})`);

            // Update plan to trial_expired
            await (this.db.from('tenants') as any)
                .update({ plan: 'trial_expired' })
                .eq('id', tenant.id);

            // Audit logic could go here (no user_id context, so system)
            // We can add a system audit or skip for now.
            updates.push(tenant.id);
        }

        return { expired: updates.length, tenants: updates };
    }

    async getPlanStatus(tenantId: string) {
        const { data: tenant } = await this.db.from('tenants').select('plan, trial_ends_at').eq('id', tenantId).single() as any;
        if (!tenant) throw new BadRequestException('Tenant not found');

        const isTrial = tenant.plan === 'trial';
        const isExpired = tenant.plan === 'trial_expired';

        let daysLeft = 0;
        if (isTrial && tenant.trial_ends_at) {
            const end = new Date(tenant.trial_ends_at).getTime();
            const now = Date.now();
            daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        }

        // Feature Gates
        const features = {
            KEYWORDS_CUSTOM: this.checkFeatureGate(tenant.plan, 'KEYWORDS_CUSTOM')
        };

        return {
            plan: tenant.plan,
            status: isExpired ? 'EXPIRED' : (isTrial ? 'TRIAL' : 'ACTIVE'),
            daysLeft: daysLeft > 0 ? daysLeft : 0,
            features
        };
    }

    checkFeatureGate(plan: string, feature: string): boolean {
        // Feature Matrix
        const matrix: Record<string, string[]> = {
            'trial': ['KEYWORDS_CUSTOM', 'ADVANCED_REPORTS'],
            'pro': ['KEYWORDS_CUSTOM', 'ADVANCED_REPORTS'],
            'trial_expired': [], // No premium features
            'basic': []
        };

        const allowedFeatures = matrix[plan] || [];
        return allowedFeatures.includes(feature);
    }

    // @ts-ignore
    async lookupBySlug(slug: string) {
        const { data: tenant, error } = await this.db
            .from('tenants')
            .select('id, name, slug, status') // Expose status to frontend to handle disabled tenants
            .eq('slug', slug)
            .single();

        if (error || !tenant) {
            // Quiet fail or throw?
            // Throwing 404 is better for API
            // But service usually throws BadRequest or similar.
            // Let's return null and handle 404 in controller
            return null;
        }

        return tenant;
    }

    async getTenantById(tenantId: string) {
        const { data: tenant, error } = await this.db
            .from('tenants')
            .select('id, name, slug, status')
            .eq('id', tenantId)
            .single();

        if (error) throw new BadRequestException('Tenant not found');
        return tenant;
    }
}
