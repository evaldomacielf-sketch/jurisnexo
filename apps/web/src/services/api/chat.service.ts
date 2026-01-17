import { api } from '@/lib/axios';

// Types
export enum ChatType {
  DIRECT = 'direct',
  GROUP = 'group',
  CASE = 'case',
  CLIENT = 'client',
}

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
  AUDIO = 'audio',
  SYSTEM = 'system',
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  fileUrl?: string;
  fileName?: string;
  replyToId?: string;
  replyToContent?: string;
  createdAt: string;
  readBy: string[];
  isEdited: boolean;
}

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  participants: ChatParticipant[];
  caseId?: string;
  clientId?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatDto {
  type: ChatType;
  name?: string;
  participantIds: string[];
  caseId?: string;
  clientId?: string;
}

export interface SendMessageDto {
  chatId: string;
  type: MessageType;
  content: string;
  fileUrl?: string;
  fileName?: string;
  replyToId?: string;
}

// API
export const chatApi = {
  // Chats
  getAll: async () => {
    const response = await api.get('/chat');
    return response.data as Chat[];
  },

  getById: async (id: string) => {
    const response = await api.get(`/chat/${id}`);
    return response.data as Chat;
  },

  create: async (data: CreateChatDto) => {
    const response = await api.post('/chat', data);
    return response.data as Chat;
  },

  // Messages
  getMessages: async (chatId: string, page = 1, limit = 50) => {
    const response = await api.get(`/chat/${chatId}/messages`, { params: { page, limit } });
    return response.data as { messages: ChatMessage[]; hasMore: boolean };
  },

  sendMessage: async (data: SendMessageDto) => {
    const response = await api.post('/chat/messages', data);
    return response.data as ChatMessage;
  },

  markAsRead: async (chatId: string, messageIds: string[]) => {
    await api.post(`/chat/${chatId}/messages/read`, { messageIds });
  },

  deleteMessage: async (messageId: string) => {
    await api.delete(`/chat/messages/${messageId}`);
  },

  getParticipants: async (chatId: string) => {
    const response = await api.get(`/chat/${chatId}/participants`);
    return response.data as ChatParticipant[];
  },
};

export default chatApi;
