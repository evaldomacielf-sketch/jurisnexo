export enum WhatsAppSessionStatus {
    Active = 'Active',
    Expired = 'Expired',
    Closed = 'Closed'
}

export enum WhatsAppMessageStatus {
    Sent = 'Sent',
    Delivered = 'Delivered',
    Read = 'Read',
    Failed = 'Failed'
}

export enum WhatsAppDirection {
    Inbound = 'Inbound',
    Outbound = 'Outbound'
}

export interface WhatsAppConversation {
    id: string;
    whatsAppId: string;
    customerName: string;
    customerPhone: string;
    sessionStatus: WhatsAppSessionStatus;
    lastCustomerMessageAt?: string;
    sessionExpiresAt?: string;
    assignedToUserId?: string;
    isBotEnabled: boolean;
    unreadCount?: number;
    isArchived?: boolean;
    messages?: WhatsAppMessage[];
}

export interface WhatsAppMessage {
    id: string;
    whatsAppConversationId: string;
    whatsAppMessageId: string;
    direction: WhatsAppDirection;
    content: string;
    messageType: string;
    mediaUrl?: string;
    status: WhatsAppMessageStatus;
    sentAt: string;
}

export interface WhatsAppTemplate {
    id: string;
    name: string;
    category: string;
    language: string;
    content: string;
    status: string;
    externalId?: string;
}

export interface SendWhatsAppMessageDto {
    phone: string;
    content: string;
    mediaUrl?: string;
}

export interface WhatsAppTag {
    id: string;
    name: string;
    color: string;
}

export interface WhatsAppProcesso {
    id: string;
    numero: string;
    titulo: string;
    status: string;
}

export interface WhatsAppContactDetails {
    id: string;
    conversationId: string;
    name: string;
    phoneNumber: string;
    avatarUrl?: string;
    email?: string;
    cpfCnpj?: string;
    endereco?: string;
    tags: WhatsAppTag[];
    processos: WhatsAppProcesso[];
    firstMessageAt?: string;
    lastMessageAt?: string;
    totalMessages: number;
    satisfactionRating?: number;
}
