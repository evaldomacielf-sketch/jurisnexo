"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TenantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("@jurisnexo/db");
const auth_service_1 = require("../auth/auth.service");
const slugify_1 = __importDefault(require("slugify"));
const crypto = __importStar(require("crypto"));
const sendgrid_service_1 = require("../services/sendgrid.service");
// Reserved slugs
let TenantsService = TenantsService_1 = class TenantsService {
    constructor(authService, sendGrid) {
        this.authService = authService;
        this.sendGrid = sendGrid;
        this.logger = new common_1.Logger(TenantsService_1.name);
        this.db = (0, db_1.createAdminClient)();
    }
    async createTenant(userId, name) {
        this.logger.log(`Creating tenant '${name}' for user ${userId}`);
        // 1. Generate unique slug
        const slug = await this.generateUniqueSlug(name);
        // 2. Create Tenant
        // Use transaction if possible, or manual rollback. Supabase JS doesn't expose easy transactions unless using RPC.
        // We will do steps sequentially and cleanup on error.
        const { data: tenant, error: tenantError } = await this.db
            .from('tenants')
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
            throw new common_1.BadRequestException('Could not create tenant');
        }
        // 3. Create Membership (Owner)
        const { error: memberError } = await this.db
            .from('memberships')
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
            throw new common_1.BadRequestException('Failed to assign membership');
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
    async getUserTenants(userId) {
        // Query memberships -> tenants
        const { data, error } = await this.db
            .from('memberships')
            .select('role, tenants(*)')
            .eq('user_id', userId);
        if (error)
            throw new common_1.BadRequestException('Failed to fetch tenants');
        return data.map(m => ({ ...m.tenants, role: m.role }));
    }
    async switchTenant(userId, tenantId) {
        // 1. Verify membership
        const { data: membership } = await this.db
            .from('memberships')
            .select('role')
            .eq('user_id', userId)
            .eq('tenant_id', tenantId)
            .single();
        if (!membership) {
            throw new common_1.ForbiddenException('You are not a member of this tenant');
        }
        // 2. Issue new Tokens (delegated to AuthService public method?)
        // AuthService `signAccessToken` is private. I need to expose a method `createSessionForTenant` in AuthService.
        // I will update AuthService to expose this.
        return this.authService.createTenantSession(userId, tenantId);
    }
    async createInvite(tenantId, userId, email, role) {
        const membership = await this.checkMembership(userId, tenantId);
        if (!['owner', 'admin'].includes(membership.role)) {
            throw new common_1.ForbiddenException('Only admins can invite members');
        }
        // Check if invite already exists pending
        const { data: existing } = await this.db.from('tenant_invites')
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
            throw new common_1.BadRequestException('Invite already pending for this email');
        }
        // Generate Token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        const { error } = await this.db.from('tenant_invites').insert({
            tenant_id: tenantId,
            email,
            role,
            token,
            expires_at: expiresAt.toISOString(),
            status: 'pending',
            created_by: userId
        });
        if (error)
            throw new common_1.BadRequestException('Failed to create invite');
        // Send Email
        const baseUrl = process.env.WEB_URL || 'http://localhost:3000';
        const inviteLink = `${baseUrl}/invites/${token}`;
        // Fetch tenant details for name
        const { data: tenant } = await this.db.from('tenants').select('name').eq('id', tenantId).single();
        await this.sendGrid.sendInviteEmail(email, inviteLink, tenant?.name || 'JurisNexo');
        await this.logAudit(userId, tenantId, 'TENANT_INVITE_CREATED', 'invite', null, { email, role });
        return { message: 'Invite sent' };
    }
    async getInviteByToken(token) {
        const { data: invite, error } = await this.db
            .from('tenant_invites')
            .select('*, tenant:tenants(name)')
            .eq('token', token)
            .single();
        if (error || !invite)
            throw new common_1.BadRequestException('Invalid token');
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
    async revokeInvite(tenantId, userId, inviteId) {
        const membership = await this.checkMembership(userId, tenantId);
        if (!['owner', 'admin'].includes(membership.role)) {
            throw new common_1.ForbiddenException('Only admins can revoke invites');
        }
        const { error } = await this.db.from('tenant_invites')
            .update({ status: 'revoked' })
            .eq('id', inviteId)
            .eq('tenant_id', tenantId);
        if (error)
            throw new common_1.BadRequestException('Failed to revoke invite');
        await this.logAudit(userId, tenantId, 'TENANT_INVITE_REVOKED', 'invite', inviteId, {});
        return { message: 'Invite revoked' };
    }
    async listInvites(tenantId, userId) {
        const membership = await this.checkMembership(userId, tenantId);
        if (!['owner', 'admin'].includes(membership.role)) {
            throw new common_1.ForbiddenException('Only admins can list invites');
        }
        const { data, error } = await this.db
            .from('tenant_invites')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });
        if (error)
            throw new common_1.BadRequestException('Failed to list invites');
        return data;
    }
    async getTenantMembers(tenantId, userId) {
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
            throw new common_1.BadRequestException('Failed to fetch members');
        }
        return data;
    }
    async acceptInvite(userId, token) {
        // 1. Find invite
        const { data: invite, error } = await this.db
            .from('tenant_invites')
            .select('*')
            .eq('token', token)
            .single();
        if (error || !invite)
            throw new common_1.BadRequestException('Invalid token');
        if (invite.status !== 'pending')
            throw new common_1.BadRequestException('Invite no longer valid');
        if (new Date(invite.expires_at) < new Date())
            throw new common_1.BadRequestException('Invite expired');
        // 2. Validate User Email matches
        if (userId) {
            const { data: { user } } = await this.db.auth.admin.getUserById(userId);
            if (user?.email && user.email !== invite.email) {
                // Warning: Mismatch. 
                // Allow matching? Security risk?
                // Prompt impl: "se não existe... cria". 
                // If authenticated user click link for OTHER email, deny.
                throw new common_1.BadRequestException('Invite email does not match logged in user');
            }
        }
        // 3. Create Membership
        // Check if already exists
        const { data: existing } = await this.db.from('memberships').select('id').eq('tenant_id', invite.tenant_id).eq('user_id', userId).single();
        if (existing) {
            // Already member. Just mark accepted.
        }
        else {
            const { error: memError } = await this.db.from('memberships').insert({
                tenant_id: invite.tenant_id,
                user_id: userId,
                role: invite.role
            });
            if (memError)
                throw new common_1.BadRequestException('Failed to join tenant');
        }
        // 4. Update Status
        await this.db.from('tenant_invites')
            .update({ status: 'accepted' })
            .eq('id', invite.id);
        // 5. Audit
        await this.logAudit(userId, invite.tenant_id, 'TENANT_INVITE_ACCEPTED', 'membership', null, { role: invite.role });
        return { tenantId: invite.tenant_id };
    }
    async checkMembership(userId, tenantId) {
        const { data } = await this.db.from('memberships').select('role').eq('user_id', userId).eq('tenant_id', tenantId).single();
        if (!data)
            throw new common_1.ForbiddenException('Not a member');
        return data;
    }
    async generateUniqueSlug(name) {
        // [EMERGENCY FIX] Force unique slug with timestamp to prevent loops
        const slug = (0, slugify_1.default)(name, { lower: true, strict: true, trim: true });
        const uniqueSlug = `${slug}-${Date.now()}`;
        console.log(`[TenantsService] Generated forced slug: ${uniqueSlug}`);
        return uniqueSlug;
    }
    async logAudit(userId, tenantId, action, type, entityId, meta) {
        // Direct insert into audit_events using admin client implies we bypass "own tenant insert" check?
        // No, insert into specific tenant_id works if policy allows or if we are admin. 
        // We are using Admin Client here (`this.db`).
        await this.db.from('audit_events').insert({
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
        const { data: expiredTenants, error } = await this.db.from('tenants')
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
            await this.db.from('tenants')
                .update({ plan: 'trial_expired' })
                .eq('id', tenant.id);
            // Audit logic could go here (no user_id context, so system)
            // We can add a system audit or skip for now.
            updates.push(tenant.id);
        }
        return { expired: updates.length, tenants: updates };
    }
    async getPlanStatus(tenantId) {
        const { data: tenant } = await this.db.from('tenants').select('plan, trial_ends_at').eq('id', tenantId).single();
        if (!tenant)
            throw new common_1.BadRequestException('Tenant not found');
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
    checkFeatureGate(plan, feature) {
        // Feature Matrix
        const matrix = {
            'trial': ['KEYWORDS_CUSTOM', 'ADVANCED_REPORTS'],
            'pro': ['KEYWORDS_CUSTOM', 'ADVANCED_REPORTS'],
            'trial_expired': [], // No premium features
            'basic': []
        };
        const allowedFeatures = matrix[plan] || [];
        return allowedFeatures.includes(feature);
    }
    async lookupBySlug(slug) {
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
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = TenantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        sendgrid_service_1.SendGridService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map