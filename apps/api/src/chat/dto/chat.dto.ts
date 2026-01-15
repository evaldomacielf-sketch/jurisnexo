import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsArray, IsBoolean, IsEnum } from 'class-validator';

// ============================================
// Chat Types
// ============================================

export enum ChatType {
    DIRECT = 'direct',     // 1:1 conversation
    GROUP = 'group',       // Group chat
    CASE = 'case',         // Related to a case
    CLIENT = 'client',     // Client communication
}

export enum MessageType {
    TEXT = 'text',
    FILE = 'file',
    IMAGE = 'image',
    AUDIO = 'audio',
    SYSTEM = 'system',
}

// ============================================
// Create/Update DTOs
// ============================================

export class CreateChatDto {
    @ApiProperty({ enum: ChatType })
    @IsEnum(ChatType)
    type: ChatType;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ type: [String], description: 'IDs dos participantes' })
    @IsArray()
    @IsUUID('4', { each: true })
    participantIds: string[];

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    caseId?: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    clientId?: string;
}

export class SendMessageDto {
    @ApiProperty()
    @IsUUID()
    chatId: string;

    @ApiProperty({ enum: MessageType })
    @IsEnum(MessageType)
    type: MessageType;

    @ApiProperty()
    @IsString()
    content: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    fileUrl?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    fileName?: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    replyToId?: string;
}

export class UpdateChatDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    participantIds?: string[];
}

// ============================================
// Response DTOs
// ============================================

export class ChatParticipantDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    avatar?: string;

    @ApiProperty()
    isOnline: boolean;

    @ApiPropertyOptional()
    lastSeen?: string;
}

export class MessageResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    chatId: string;

    @ApiProperty()
    senderId: string;

    @ApiProperty()
    senderName: string;

    @ApiPropertyOptional()
    senderAvatar?: string;

    @ApiProperty({ enum: MessageType })
    type: MessageType;

    @ApiProperty()
    content: string;

    @ApiPropertyOptional()
    fileUrl?: string;

    @ApiPropertyOptional()
    fileName?: string;

    @ApiPropertyOptional()
    replyToId?: string;

    @ApiPropertyOptional()
    replyToContent?: string;

    @ApiProperty()
    createdAt: string;

    @ApiPropertyOptional()
    readBy: string[];

    @ApiProperty()
    isEdited: boolean;
}

export class ChatResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: ChatType })
    type: ChatType;

    @ApiPropertyOptional()
    name?: string;

    @ApiProperty({ type: [ChatParticipantDto] })
    participants: ChatParticipantDto[];

    @ApiPropertyOptional()
    caseId?: string;

    @ApiPropertyOptional()
    clientId?: string;

    @ApiPropertyOptional()
    lastMessage?: MessageResponseDto;

    @ApiProperty()
    unreadCount: number;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;
}

// ============================================
// WebSocket Events
// ============================================

export interface WsJoinChatPayload {
    chatId: string;
}

export interface WsLeavePayload {
    chatId: string;
}

export interface WsTypingPayload {
    chatId: string;
    isTyping: boolean;
}

export interface WsMessageStatusPayload {
    messageId: string;
    status: 'delivered' | 'read';
}
