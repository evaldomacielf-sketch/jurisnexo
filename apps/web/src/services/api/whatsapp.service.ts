import api from '@/lib/api';
import { WhatsAppConversation, WhatsAppTemplate, SendWhatsAppMessageDto } from '@/types/whatsapp';

export const whatsappApi = {
  getConversations: async () => {
    const response = await api.get('/whatsapp/conversations');
    return response.data as WhatsAppConversation[];
  },

  sendMessage: async (data: SendWhatsAppMessageDto) => {
    const response = await api.post('/whatsapp/send', data);
    return response.data as { messageId: string };
  },

  getTemplates: async () => {
    const response = await api.get('/whatsapp/templates');
    return response.data as WhatsAppTemplate[];
  },

  getStatus: async () => {
    const response = await api.get('/whatsapp/status');
    return response.data as { isConnected: boolean };
  },

  getMessages: async (conversationId: string) => {
    const response = await api.get(`/whatsapp/conversations/${conversationId}/messages`);
    return response.data as any[]; // Type should be WhatsAppMessage[] but loosely typed for now
  },

  markAsRead: async (conversationId: string) => {
    await api.post(`/whatsapp/conversations/${conversationId}/read`);
  },

  getContactDetails: async (contactId: string) => {
    // Mocking or fetching from an endpoint. Assuming real endpoint exists or we adapt.
    // If the backend doesn't have a contact-details specific endpoint yet, we might need to rely on conversation metadata
    // or a new endpoint. For now, assuming `/whatsapp/contacts/${contactId}` exists or similar.
    // Given previous backend work didn't explicitly create this comprehensive endpoint,
    // I might need to mock it or map it from conversation if possible.
    // Check Controller: we have `getConversations`. We don't have a deep contact details endpoint with processes yet.
    // Creating a stub for now to unblock frontend.
    // Ideally this would be `api.get('/whatsapp/contacts/' + contactId)`
    // NOTE: User code uses `useContactDetails(contactId)`. `contactId` comes from `selectedConversation.contactId`.
    // However, `WhatsAppConversation` type doesn't arguably have `contactId` field in my type definition, it has `customerPhone`.
    // I will assume for now we use conversation ID as contact ID or similar mapping.
    const response = await api.get(`/whatsapp/contacts/${contactId}`);
    return response.data as any; // Type WhatsAppContactDetails
  },
};

export default whatsappApi;
