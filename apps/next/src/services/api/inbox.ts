import { apiClient, handleApiError } from './client';
import type {
    Conversation,
    Message,
    ConversationFilters,
    SendMessageData,
    MessageTemplate,
    PaginatedResponse
} from '@/types/inbox';

export const inboxApi = {
    /**
     * Lista conversas com filtros
     */
    async getConversations(filters?: ConversationFilters): Promise<PaginatedResponse<Conversation>> {
        try {
            const { data } = await apiClient.get<PaginatedResponse<Conversation>>(
                '/inbox/conversations',
                { params: filters }
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Busca conversas não lidas
     */
    async getUnreadCount(): Promise<{ count: number }> {
        try {
            const { data } = await apiClient.get<{ count: number }>('/inbox/unread-count');
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Busca conversas por ID
     */
    async getConversation(conversationId: string): Promise<Conversation> {
        try {
            const { data } = await apiClient.get<Conversation>(
                `/inbox/conversations/${conversationId}`
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Lista mensagens de uma conversa
     */
    async getMessages(conversationId: string, page = 1): Promise<PaginatedResponse<Message>> {
        try {
            const { data } = await apiClient.get<PaginatedResponse<Message>>(
                `/inbox/conversations/${conversationId}/messages`,
                { params: { page } }
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Envia mensagem
     */
    async sendMessage(conversationId: string, messageData: SendMessageData): Promise<Message> {
        try {
            const { data } = await apiClient.post<Message>(
                `/inbox/conversations/${conversationId}/messages`,
                messageData
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Marca conversa como lida
     */
    async markAsRead(conversationId: string): Promise<void> {
        try {
            await apiClient.post(`/inbox/conversations/${conversationId}/mark-read`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Atribui conversa a um usuário
     */
    async assignConversation(conversationId: string, userId: string): Promise<Conversation> {
        try {
            const { data } = await apiClient.post<Conversation>(
                `/inbox/conversations/${conversationId}/assign`,
                { user_id: userId }
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Atualiza status da conversa
     */
    async updateConversationStatus(
        conversationId: string,
        status: Conversation['status']
    ): Promise<Conversation> {
        try {
            const { data } = await apiClient.patch<Conversation>(
                `/inbox/conversations/${conversationId}`,
                { status }
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Lista templates de mensagem
     */
    async getMessageTemplates(): Promise<MessageTemplate[]> {
        try {
            const { data } = await apiClient.get<MessageTemplate[]>('/inbox/templates');
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    /**
     * Upload de mídia (imagem, documento, áudio)
     */
    async uploadMedia(formData: FormData): Promise<{ url: string; media_id: string }> {
        try {
            const { data } = await apiClient.post<{ url: string; media_id: string }>(
                '/inbox/upload-media',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },
};
