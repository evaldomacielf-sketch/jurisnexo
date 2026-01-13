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
var EventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let EventsGateway = EventsGateway_1 = class EventsGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(EventsGateway_1.name);
    }
    async handleConnection(client) {
        try {
            // Validate Token (Expect 'token' in query or auth header)
            const token = client.handshake.query.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            // Verify
            const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
            client.data.user = payload;
            // Join Tenant Room
            const tenantId = payload.tenant_id;
            if (tenantId) {
                await client.join(`tenant:${tenantId}`);
                this.logger.log(`Client ${client.id} joined tenant room: ${tenantId}`);
            }
        }
        catch (e) {
            this.logger.error('Connection unauthorized', e);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleJoinConversation(client, conversationId) {
        client.join(`conversation:${conversationId}`);
        this.logger.log(`Client ${client.id} joined conversation: ${conversationId}`);
    }
    handleLeaveConversation(client, conversationId) {
        client.leave(`conversation:${conversationId}`);
    }
    handleTyping(client, payload) {
        client.to(`conversation:${payload.conversationId}`).emit('typing', {
            userId: client.data.user?.sub,
            userName: client.data.user?.full_name, // Optional if we put it in token
            ...payload
        });
    }
    // Helper to emit new messages
    emitNewMessage(tenantId, conversationId, message) {
        // Emit to conversation room
        this.server.to(`conversation:${conversationId}`).emit('message.new', message);
        // Also emit to tenant room for Inbox list updates? Or separate room?
        // Maybe just conversation update event
        this.server.to(`tenant:${tenantId}`).emit('conversation.updated', {
            id: conversationId,
            last_message: message,
            last_message_at: new Date().toISOString()
        });
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinConversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveConversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleTyping", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*', // Adjust for production
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map