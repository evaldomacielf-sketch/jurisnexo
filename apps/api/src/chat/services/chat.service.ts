import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import {
    CreateChatDto,
    UpdateChatDto,
    SendMessageDto,
    ChatResponseDto,
    MessageResponseDto,
} from '../dto/chat.dto';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(private readonly supabase: SupabaseService) { }

    /**
     * Create a new chat
     */
    async createChat(tenantId: string, userId: string, dto: CreateChatDto): Promise<ChatResponseDto> {
        // Create chat
        const { data: chat, error } = await this.supabase.client
            .from('chats')
            .insert({
                tenant_id: tenantId,
                created_by: userId,
                type: dto.type,
                name: dto.name,
                case_id: dto.caseId,
                client_id: dto.clientId,
            })
            .select()
            .single();

        if (error) throw error;

        // Add participants (including creator)
        const allParticipants = [...new Set([userId, ...dto.participantIds])];
        const participantRecords = allParticipants.map(participantId => ({
            chat_id: chat.id,
            user_id: participantId,
        }));

        await this.supabase.client
            .from('chat_participants')
            .insert(participantRecords);

        this.logger.log(`Chat created: ${chat.id}`);
        return this.getChatById(chat.id, userId);
    }

    /**
     * Get user's chats
     */
    async getUserChats(tenantId: string, userId: string): Promise<ChatResponseDto[]> {
        // Get chats where user is participant
        const { data: participations } = await this.supabase.client
            .from('chat_participants')
            .select('chat_id')
            .eq('user_id', userId);

        if (!participations || participations.length === 0) return [];

        const chatIds = participations.map(p => p.chat_id);

        const { data: chats, error } = await this.supabase.client
            .from('chats')
            .select('*')
            .eq('tenant_id', tenantId)
            .in('id', chatIds)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return Promise.all((chats || []).map(chat => this.mapToResponse(chat, userId)));
    }

    /**
     * Get chat by ID
     */
    async getChatById(chatId: string, userId: string): Promise<ChatResponseDto> {
        const { data: chat, error } = await this.supabase.client
            .from('chats')
            .select('*')
            .eq('id', chatId)
            .single();

        if (error || !chat) throw new NotFoundException('Chat não encontrado');
        return this.mapToResponse(chat, userId);
    }

    /**
     * Send message
     */
    async sendMessage(userId: string, dto: SendMessageDto): Promise<MessageResponseDto> {
        const { data: message, error } = await this.supabase.client
            .from('chat_messages')
            .insert({
                chat_id: dto.chatId,
                sender_id: userId,
                type: dto.type,
                content: dto.content,
                file_url: dto.fileUrl,
                file_name: dto.fileName,
                reply_to_id: dto.replyToId,
            })
            .select()
            .single();

        if (error) throw error;

        // Update chat's updated_at
        await this.supabase.client
            .from('chats')
            .update({ updated_at: new Date() })
            .eq('id', dto.chatId);

        this.logger.log(`Message sent in chat ${dto.chatId}`);
        return this.mapMessageToResponse(message);
    }

    /**
     * Get chat messages
     */
    async getMessages(chatId: string, page = 1, limit = 50): Promise<{ messages: MessageResponseDto[]; hasMore: boolean }> {
        const offset = (page - 1) * limit;

        const { data: messages, error, count } = await this.supabase.client
            .from('chat_messages')
            .select('*, sender:users(id, name, avatar)', { count: 'exact' })
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit);

        if (error) throw error;

        return {
            messages: (messages || []).reverse().map(this.mapMessageToResponse),
            hasMore: (count || 0) > offset + limit,
        };
    }

    /**
     * Mark messages as read
     */
    async markAsRead(chatId: string, userId: string, messageIds: string[]): Promise<void> {
        // Add user to read_by array for each message
        for (const messageId of messageIds) {
            await this.supabase.client.rpc('add_to_read_by', {
                p_message_id: messageId,
                p_user_id: userId,
            });
        }
    }

    /**
     * Get unread count
     */
    async getUnreadCount(chatId: string, userId: string): Promise<number> {
        const { count } = await this.supabase.client
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chatId)
            .not('read_by', 'cs', `{${userId}}`);

        return count || 0;
    }

    /**
     * Update chat
     */
    async updateChat(chatId: string, dto: UpdateChatDto): Promise<ChatResponseDto> {
        const updateData: any = { updated_at: new Date() };

        if (dto.name) updateData.name = dto.name;

        const { error } = await this.supabase.client
            .from('chats')
            .update(updateData)
            .eq('id', chatId);

        if (error) throw error;

        // Update participants if provided
        if (dto.participantIds) {
            await this.supabase.client
                .from('chat_participants')
                .delete()
                .eq('chat_id', chatId);

            const participantRecords = dto.participantIds.map(userId => ({
                chat_id: chatId,
                user_id: userId,
            }));

            await this.supabase.client
                .from('chat_participants')
                .insert(participantRecords);
        }

        return this.getChatById(chatId, '');
    }

    /**
     * Delete message
     */
    async deleteMessage(messageId: string, userId: string): Promise<void> {
        await this.supabase.client
            .from('chat_messages')
            .update({
                content: 'Mensagem apagada',
                is_deleted: true,
            })
            .eq('id', messageId)
            .eq('sender_id', userId);
    }

    /**
     * Get chat participants
     */
    async getParticipants(chatId: string) {
        const { data } = await this.supabase.client
            .from('chat_participants')
            .select('user:users(id, name, avatar)')
            .eq('chat_id', chatId);

        return data?.map((p: any) => p.user) || [];
    }

    private async mapToResponse(chat: any, userId: string): Promise<ChatResponseDto> {
        const participants = await this.getParticipants(chat.id);
        const unreadCount = await this.getUnreadCount(chat.id, userId);

        // Get last message
        const { data: lastMessages } = await this.supabase.client
            .from('chat_messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1);

        return {
            id: chat.id,
            type: chat.type,
            name: chat.name,
            participants: participants.map((p: any) => ({
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                isOnline: false, // Would be updated by presence system
            })),
            caseId: chat.case_id,
            clientId: chat.client_id,
            lastMessage: lastMessages?.[0] ? this.mapMessageToResponse(lastMessages[0]) : undefined,
            unreadCount,
            createdAt: chat.created_at,
            updatedAt: chat.updated_at,
        };
    }

    private mapMessageToResponse(message: any): MessageResponseDto {
        return {
            id: message.id,
            chatId: message.chat_id,
            senderId: message.sender_id,
            senderName: message.sender?.name || 'Usuário',
            senderAvatar: message.sender?.avatar,
            type: message.type,
            content: message.content,
            fileUrl: message.file_url,
            fileName: message.file_name,
            replyToId: message.reply_to_id,
            replyToContent: message.reply_to?.content,
            createdAt: message.created_at,
            readBy: message.read_by || [],
            isEdited: message.is_edited || false,
        };
    }
}
