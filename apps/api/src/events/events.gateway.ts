import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: '*', // Adjust for production
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(EventsGateway.name);

    constructor(private readonly jwtService: JwtService) { }

    async handleConnection(client: Socket) {
        try {
            // Validate Token (Expect 'token' in query or auth header)
            const token = client.handshake.query.token as string || client.handshake.headers.authorization?.split(' ')[1];
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

        } catch (e) {
            this.logger.error('Connection unauthorized', e);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinConversation')
    handleJoinConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() conversationId: string
    ) {
        client.join(`conversation:${conversationId}`);
        this.logger.log(`Client ${client.id} joined conversation: ${conversationId}`);
    }

    @SubscribeMessage('leaveConversation')
    handleLeaveConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() conversationId: string
    ) {
        client.leave(`conversation:${conversationId}`);
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { conversationId: string; isTyping: boolean }
    ) {
        client.to(`conversation:${payload.conversationId}`).emit('typing', {
            userId: client.data.user?.sub,
            userName: client.data.user?.full_name, // Optional if we put it in token
            ...payload
        });
    }

    // Helper to emit new messages
    emitNewMessage(tenantId: string, conversationId: string, message: any) {
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
}
