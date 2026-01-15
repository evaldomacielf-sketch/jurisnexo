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
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import {
    SendMessageDto,
    WsJoinChatPayload,
    WsTypingPayload,
    WsMessageStatusPayload,
} from '../dto/chat.dto';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    tenantId?: string;
}

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);
    private readonly onlineUsers = new Map<string, Set<string>>(); // chatId -> userIds

    constructor(private readonly chatService: ChatService) { }

    // ============================================
    // Connection Lifecycle
    // ============================================

    async handleConnection(client: AuthenticatedSocket) {
        try {
            // Extract user info from token (simplified)
            const token = client.handshake.auth?.token;
            if (!token) {
                client.disconnect();
                return;
            }

            // In production, validate JWT and extract user info
            // For now, use handshake data
            client.userId = client.handshake.auth.userId;
            client.tenantId = client.handshake.auth.tenantId;

            this.logger.log(`Client connected: ${client.userId}`);

            // Join user's personal room for direct notifications
            client.join(`user:${client.userId}`);
        } catch (error) {
            this.logger.error('Connection error', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        this.logger.log(`Client disconnected: ${client.userId}`);

        // Remove from all online user lists
        this.onlineUsers.forEach((users, chatId) => {
            if (client.userId && users.has(client.userId)) {
                users.delete(client.userId);
                this.server.to(chatId).emit('user:offline', { userId: client.userId });
            }
        });
    }

    // ============================================
    // Chat Room Events
    // ============================================

    @SubscribeMessage('chat:join')
    async handleJoinChat(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: WsJoinChatPayload,
    ) {
        const { chatId } = payload;

        // Join socket room
        client.join(chatId);

        // Track online status
        if (!this.onlineUsers.has(chatId)) {
            this.onlineUsers.set(chatId, new Set());
        }
        this.onlineUsers.get(chatId)?.add(client.userId!);

        // Notify others
        client.to(chatId).emit('user:online', { userId: client.userId });

        // Get online users in this chat
        const onlineUserIds = Array.from(this.onlineUsers.get(chatId) || []);

        return { success: true, onlineUsers: onlineUserIds };
    }

    @SubscribeMessage('chat:leave')
    handleLeaveChat(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: WsJoinChatPayload,
    ) {
        const { chatId } = payload;

        client.leave(chatId);

        // Remove from online users
        this.onlineUsers.get(chatId)?.delete(client.userId!);

        // Notify others
        client.to(chatId).emit('user:offline', { userId: client.userId });

        return { success: true };
    }

    // ============================================
    // Messaging Events
    // ============================================

    @SubscribeMessage('message:send')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: SendMessageDto,
    ) {
        try {
            const message = await this.chatService.sendMessage(client.userId!, payload);

            // Broadcast to chat room
            this.server.to(payload.chatId).emit('message:new', message);

            // Send push notification to offline participants
            // TODO: Implement push notifications

            return { success: true, message };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('message:read')
    async handleMessageRead(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: { chatId: string; messageIds: string[] },
    ) {
        await this.chatService.markAsRead(payload.chatId, client.userId!, payload.messageIds);

        // Notify message senders
        this.server.to(payload.chatId).emit('message:read', {
            userId: client.userId,
            messageIds: payload.messageIds,
        });

        return { success: true };
    }

    @SubscribeMessage('message:delete')
    async handleDeleteMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: { chatId: string; messageId: string },
    ) {
        await this.chatService.deleteMessage(payload.messageId, client.userId!);

        // Notify chat room
        this.server.to(payload.chatId).emit('message:deleted', {
            messageId: payload.messageId,
        });

        return { success: true };
    }

    // ============================================
    // Presence Events
    // ============================================

    @SubscribeMessage('typing:start')
    handleTypingStart(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: WsTypingPayload,
    ) {
        client.to(payload.chatId).emit('user:typing', {
            userId: client.userId,
            isTyping: true,
        });
    }

    @SubscribeMessage('typing:stop')
    handleTypingStop(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: WsTypingPayload,
    ) {
        client.to(payload.chatId).emit('user:typing', {
            userId: client.userId,
            isTyping: false,
        });
    }

    // ============================================
    // Utility Methods
    // ============================================

    /**
     * Send notification to specific user
     */
    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }

    /**
     * Send notification to chat room
     */
    sendToChat(chatId: string, event: string, data: any) {
        this.server.to(chatId).emit(event, data);
    }

    /**
     * Get online status for users
     */
    getOnlineUsers(chatId: string): string[] {
        return Array.from(this.onlineUsers.get(chatId) || []);
    }
}
