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
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const calendar_service_1 = require("./calendar.service");
const auth_guard_1 = require("../../auth.guard");
const swagger_1 = require("@nestjs/swagger");
let CalendarController = class CalendarController {
    constructor(calendarService) {
        this.calendarService = calendarService;
    }
    async connect(req) {
        return this.calendarService.generateAuthUrl(req.user.id);
    }
    async callback(req, code) {
        return this.calendarService.connect(req.user.id, code);
    }
    async schedule(req, body) {
        return this.calendarService.scheduleMeeting(req.user.tenantId, req.user.id, body);
    }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('connect'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Google OAuth URL' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "connect", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Exchange OAuth Code' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "callback", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('schedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule a meeting' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "schedule", null);
exports.CalendarController = CalendarController = __decorate([
    (0, swagger_1.ApiTags)('Calendar'),
    (0, common_1.Controller)('crm/calendar'),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService])
], CalendarController);
//# sourceMappingURL=calendar.controller.js.map