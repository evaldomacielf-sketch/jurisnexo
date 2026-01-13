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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
const auth_service_1 = require("../auth/auth.service");
const auth_guard_1 = require("../auth.guard"); // I need to create this!
// Or use request object assuming middleware puts user?
// I haven't created a Guard yet. The Prompt 4 ended with Controller/Service. 
// I should create a JWT Auth Guard to extract user from Access Token cookie/header.
let TenantsController = class TenantsController {
    constructor(tenantsService, authService) {
        this.tenantsService = tenantsService;
        this.authService = authService;
    }
    async create(name, req) {
        console.log(`[TenantsController] Create request for: ${name}, User: ${req.user?.sub}`);
        // For now mocking user ID from request until Guard implemented.
        // In real flow: req.user.sub
        if (!req.user?.sub)
            throw new common_1.BadRequestException('User not authenticated');
        const result = await this.tenantsService.createTenant(req.user.sub, name);
        console.log(`[TenantsController] Created tenant:`, result);
        return result;
    }
    async listMe(req) {
        if (!req.user?.sub)
            throw new common_1.BadRequestException('User not authenticated');
        return this.tenantsService.getUserTenants(req.user.sub);
    }
    async switchTenant(tenantId, req, res) {
        if (!req.user?.sub)
            throw new common_1.BadRequestException('User not authenticated');
        const { accessToken, refreshToken } = await this.tenantsService.switchTenant(req.user.sub, tenantId);
        this.authService.setCookies(res, accessToken, refreshToken);
        return res.json({ message: 'Context switched' });
    }
    async listMembers(req) {
        const tenantId = req.user?.tenant_id; // Setup in AuthGuard/Strategy from JWT payload
        if (!tenantId)
            throw new common_1.BadRequestException('No active tenant context');
        return this.tenantsService.getTenantMembers(tenantId, req.user.sub);
    }
    async listInvites(req) {
        const tenantId = req.user?.tenant_id;
        if (!tenantId)
            throw new common_1.BadRequestException('No active tenant context');
        return this.tenantsService.listInvites(tenantId, req.user.sub);
    }
    async createInvite(body, req) {
        const tenantId = req.user?.tenant_id;
        if (!tenantId)
            throw new common_1.BadRequestException('No active tenant context');
        if (!body.email || !body.role)
            throw new common_1.BadRequestException('Email and role required');
        return this.tenantsService.createInvite(tenantId, req.user.sub, body.email, body.role);
    }
    async revokeInvite(id, req) {
        const tenantId = req.user?.tenant_id;
        if (!tenantId)
            throw new common_1.BadRequestException('No active tenant context');
        return this.tenantsService.revokeInvite(tenantId, req.user.sub, id);
    }
    async getInvite(token) {
        return this.tenantsService.getInviteByToken(token);
    }
    async acceptInvite(token, req) {
        if (!req.user?.sub)
            throw new common_1.BadRequestException('User not authenticated');
        return this.tenantsService.acceptInvite(req.user.sub, token);
    }
    async getPlan(req) {
        const tenantId = req.user?.tenant_id;
        if (!tenantId)
            throw new common_1.BadRequestException('No active tenant context');
        return this.tenantsService.getPlanStatus(tenantId);
    }
    // System/Cron endpoint. In production, protect with specific Cron secret guard.
    // @UseGuards(CronGuard)
    async expireTrials() {
        return this.tenantsService.checkTrialExpiration();
    }
    async lookupBySlug(slug) {
        const tenant = await this.tenantsService.lookupBySlug(slug);
        if (!tenant)
            throw new common_1.BadRequestException('Tenant not found');
        return tenant;
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "listMe", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('me/active-tenant'),
    __param(0, (0, common_1.Body)('tenantId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "switchTenant", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('me/members'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "listMembers", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('me/invites'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "listInvites", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('me/invites'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "createInvite", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)('me/invites/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "revokeInvite", null);
__decorate([
    (0, common_1.Get)('invites/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getInvite", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('invites/accept'),
    __param(0, (0, common_1.Body)('token')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('me/plan'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Post)('cron/expire-trials'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "expireTrials", null);
__decorate([
    (0, common_1.Get)('lookup/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "lookupBySlug", null);
exports.TenantsController = TenantsController = __decorate([
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService,
        auth_service_1.AuthService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map