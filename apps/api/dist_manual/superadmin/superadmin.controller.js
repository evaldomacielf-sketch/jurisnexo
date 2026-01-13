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
exports.SuperadminController = void 0;
const common_1 = require("@nestjs/common");
const superadmin_service_1 = require("./superadmin.service");
const auth_guard_1 = require("../auth.guard");
const swagger_1 = require("@nestjs/swagger");
let SuperadminController = class SuperadminController {
    constructor(superadminService) {
        this.superadminService = superadminService;
    }
    async listTenants(req) {
        await this.superadminService.checkIsSuperadmin(req.user.id);
        return this.superadminService.listTenants();
    }
    async getAuditLogs(req) {
        await this.superadminService.checkIsSuperadmin(req.user.id);
        return this.superadminService.getGlobalAuditLogs();
    }
    async disableTenant(req, id, reason) {
        await this.superadminService.checkIsSuperadmin(req.user.id);
        return this.superadminService.disableTenant(req.user.id, id, reason);
    }
};
exports.SuperadminController = SuperadminController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('tenants'),
    (0, swagger_1.ApiOperation)({ summary: 'List all tenants (Superadmin only)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperadminController.prototype, "listTenants", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('audit'),
    (0, swagger_1.ApiOperation)({ summary: 'Get global audit logs (Superadmin only)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperadminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('tenants/:id/disable'),
    (0, swagger_1.ApiOperation)({ summary: 'Disable a tenant' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SuperadminController.prototype, "disableTenant", null);
exports.SuperadminController = SuperadminController = __decorate([
    (0, swagger_1.ApiTags)('Superadmin'),
    (0, common_1.Controller)('super'),
    __metadata("design:paramtypes", [superadmin_service_1.SuperadminService])
], SuperadminController);
//# sourceMappingURL=superadmin.controller.js.map