import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinConversation(client: Socket, conversationId: string): void;
    handleLeaveConversation(client: Socket, conversationId: string): void;
    handleTyping(client: Socket, payload: {
        conversationId: string;
        isTyping: boolean;
    }): void;
    emitNewMessage(tenantId: string, conversationId: string, message: any): void;
}
//# sourceMappingURL=events.gateway.d.ts.map