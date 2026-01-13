"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperadminService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let SuperadminService = class SuperadminService {
    constructor(db) {
        this.db = db;
    }
    async checkIsSuperadmin(userId) {
        const { data, error } = await this.db.client
            .from('crm_super_admins')
            .select('user_id')
            .eq('user_id', userId)
            .single();
        if (error || !data) {
            throw new common_1.ForbiddenException('Access denied: Superadmin role required');
        }
        return true;
    }
    async listTenants() {
        // In real app: join with memberships to count users usually
        const { data, error } = await this.db.client
            .from('tenants')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    }
    async getGlobalAuditLogs() {
        const { data, error } = await this.db.client
            .from('crm_audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
        if (error)
            throw new Error(error.message);
        return data;
    }
    async disableTenant(adminUserId, tenantId, reason) {
        // 1. Update Tenant
        const { error } = await this.db.client
            .from('tenants')
            .update({ status: 'DISABLED', disabled_reason: reason })
            .eq('id', tenantId);
        if (error)
            throw new Error(error.message);
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
};
exports.SuperadminService = SuperadminService;
exports.SuperadminService = SuperadminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], SuperadminService);
//# sourceMappingURL=superadmin.service.js.map