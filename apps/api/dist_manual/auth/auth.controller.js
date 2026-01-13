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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
// Pipe for Zod? Or manual validation. 
// Standard NestJS Zod Pipe is common. I'll do manual for simplicity or use ValidationPipe if setup.
// I'll stick to simple manual parse or validation pipe if I configured it (I used ValidationPipe in main.ts).
// But ValidationPipe uses class-validator. My DTOs are Zod. 
// I'll add a ZodPipe or just parse in controller.
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async requestCode(body) {
        // Logic inside service handles validation if passed correctly, but better to parse here.
        const { email } = auth_dto_1.RequestCodeSchema.parse(body);
        return this.authService.requestCode(email);
    }
    async exchange(body, res) {
        const { email, code } = auth_dto_1.ExchangeCodeSchema.parse(body);
        return this.authService.exchangeCode(email, code, res);
    }
    async registerInvite(body, res) {
        // Simple manual validation
        if (!body.token || !body.fullName || !body.password)
            throw new Error('Missing fields'); // Should rely on Filter/Exception
        return this.authService.registerWithInvite(body.token, body.fullName, body.password, res);
    }
    async logout(res) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
        return { message: 'Logged out' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('request-code'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestCode", null);
__decorate([
    (0, common_1.Post)('exchange'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "exchange", null);
__decorate([
    (0, common_1.Post)('register-invite'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerInvite", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map