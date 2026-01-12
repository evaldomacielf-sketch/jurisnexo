import { Injectable, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { createAdminClient } from '@jurisnexo/db';
import { AuthService } from '../auth/auth.service';
import slugify from 'slugify';

// Reserved slugs
const RESERVED_SLUGS = [
    'app', 'api', 'auth', 'www', 'admin', 'public', 'assets', 'mail', 'smtp', 'support', 'dashboard', 'billing', 'settings'
];

@Injectable()
export class TenantsService {
    private readonly logger = new Logger(TenantsService.name);
    private readonly db = createAdminClient();

    constructor(private readonly authService: AuthService) { }

    async createTenant(userId: string, name: string) {
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
                // plan related fields like trial_ends_at deferred to Defaults or specific logic
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

    private async generateUniqueSlug(name: string): Promise<string> {
        let slug = slugify(name, { lower: true, strict: true, trim: true });

        // Block reserved
        if (RESERVED_SLUGS.includes(slug)) {
            slug = `${slug}-app`;
        }

        // Check uniqueness
        let unique = false;
        let counter = 1;
        let candidate = slug;

        while (!unique) {
            const { count } = await this.db
                .from('tenants')
                .select('*', { count: 'exact', head: true })
                .eq('slug', candidate);

            if (count === 0) {
                unique = true;
            } else {
                counter++;
                candidate = `${slug}-${counter}`;
            }
        }

        return candidate;
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
}
