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
exports.CrmController = void 0;
const common_1 = require("@nestjs/common");
const crm_service_1 = require("./crm.service");
const auth_guard_1 = require("../auth.guard"); // Assuming AuthGuard exists in parent
const swagger_1 = require("@nestjs/swagger");
let CrmController = class CrmController {
    constructor(crmService) {
        this.crmService = crmService;
    }
    async getConversations(req, query) {
        return this.crmService.getConversations(req.user.tenantId, query);
    }
    async getConversation(req, id) {
        return this.crmService.getConversation(req.user.tenantId, id);
    }
    async sendMessage(req, id, content) {
        return this.crmService.sendMessage(req.user.tenantId, id, content, req.user.id);
    }
    // Webhook for Inbound Messages (Public or Protected via API Key)
    // For simplicity, we assume a simulated open endpoint or basic auth handled elsewhere
    async handleInbound(body) {
        // Body: { from: string, content: string, providerId: string, tenantId: string }
        // In real scenario, tenantId comes from the webhook config or headers
        return this.crmService.handleInbound(body.tenantId, body.from, body.content, body.providerId);
    }
};
exports.CrmController = CrmController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'List conversations' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getConversations", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('conversations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversation details' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getConversation", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('conversations/:id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('inbound'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle inbound message webhook' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "handleInbound", null);
exports.CrmController = CrmController = __decorate([
    (0, swagger_1.ApiTags)('CRM'),
    (0, common_1.Controller)('crm'),
    __metadata("design:paramtypes", [crm_service_1.CrmService])
], CrmController);
//# sourceMappingURL=crm.controller.js.map