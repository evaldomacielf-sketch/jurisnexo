import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SuperadminService {
    constructor(private readonly db: DatabaseService) { }

    async checkIsSuperadmin(userId: string) {
        const { data, error } = await this.db.client
            .from('crm_super_admins')
            .select('user_id')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            throw new ForbiddenException('Access denied: Superadmin role required');
        }
        return true;
    }

    async listTenants() {
        // In real app: join with memberships to count users usually
        const { data, error } = await this.db.client
            .from('tenants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    async getGlobalAuditLogs() {
        const { data, error } = await this.db.client
            .from('crm_audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw new Error(error.message);
        return data;
    }

    async disableTenant(adminUserId: string, tenantId: string, reason: string) {
        // 1. Update Tenant
        const { error } = await this.db.client
            .from('tenants')
            .update({ status: 'DISABLED', disabled_reason: reason } as any)
            .eq('id', tenantId);

        if (error) throw new Error(error.message);

        // 2. Log Action
        await this.db.client.from('crm_audit_logs').insert({
            tenant_id: tenantId,
            entity_type: 'TENANT',
            entity_id: tenantId,
            action: 'SUPERADMIN_TENANT_DISABLED',
            actor_id: adminUserId,
            new_value: { reason }
        });
    }
}
