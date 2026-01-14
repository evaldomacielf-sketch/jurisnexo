import type { PaginatedResponse } from './common';

export interface Conversation {
    id: string;
    tenant_id: string;
    contact_id: string;
    contact: {
        id: string;
        name: string;
        phone: string;
        avatar_url?: string;
    };
    last_message?: Message;
    unread_count: number;
    status: ConversationStatus;
    assigned_to?: {
        id: string;
        name: string;
    };
    priority: ConversationPriority;
    created_at: string;
    updated_at: string;
}

export type ConversationStatus = 'open' | 'pending' | 'closed';
export type ConversationPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface Message {
    id: string;
    conversation_id: string;
    sender_type: 'user' | 'contact';
    sender_id: string;
    content: string;
    message_type: MessageType;
    media_url?: string;
    is_read: boolean;
    sent_at: string;
}

export type MessageType = 'text' | 'image' | 'document' | 'audio' | 'video';

export interface ConversationFilters {
    status?: ConversationStatus;
    priority?: ConversationPriority;
    assigned_to?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface SendMessageData {
    content: string;
    message_type: MessageType;
    media_url?: string;
}

export interface MessageTemplate {
    id: string;
    name: string;
    content: string;
    category: string;
}
