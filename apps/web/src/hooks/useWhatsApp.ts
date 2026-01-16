import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { whatsappApi } from '@/services/api/whatsapp.service';
import { WhatsAppConversation } from '@/types/whatsapp';

interface UseWhatsAppOptions {
  filter: 'all' | 'unread' | 'archived';
  search: string;
}

export function useWhatsAppConversations({ filter, search }: UseWhatsAppOptions) {
  return useQuery({
    queryKey: ['whatsapp-conversations'],
    queryFn: whatsappApi.getConversations,
    select: (data: WhatsAppConversation[]) => {
      return data.filter((conv) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          conv.customerName.toLowerCase().includes(searchLower) ||
          conv.customerPhone.includes(searchLower);

        if (!matchesSearch) return false;

        if (filter === 'unread') {
          // Check unread count or if there are unread messages (fallback)
          return conv.unreadCount && conv.unreadCount > 0;
        }
        if (filter === 'archived') {
          return conv.isArchived || conv.sessionStatus === 'Closed';
        }
        // 'all' (usually excludes archived unless searched specifically?
        // User logic: "all" usually means "active").
        // Let's assume 'all' excludes archived.
        return !conv.isArchived && conv.sessionStatus !== 'Closed';
      });
    },
  });
}

export function useWhatsAppMessages(conversationId: string) {
  return useQuery({
    queryKey: ['whatsapp-messages', conversationId],
    queryFn: () => whatsappApi.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 5000, // Simple polling for new messages
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { conversationId: string; content: string }) => {
      // Mapping conversationId to phone or using specific endpoint?
      // The current API uses phone. We need to fetch conv to get phone or assume API handles Id.
      // Assuming we have phone in the component context usually, but here we only pass ID.
      // Let's assume we have to find the phone or the API supports ID.
      // Actually `whatsappApi.sendMessage` takes `SendWhatsAppMessageDto` which has `phone`.
      // We'll fix the component to pass `phone` or update the service later.
      // For now, let's assuming the component passes the FULL DTO or we retrieve it.
      // WAIT: Component calls `sendMessage.mutateAsync({ conversationId, content })`.
      // The User provided code passes `conversationId`.
      // I will adapt the mutation to fetch the conversation from cache or just accept it might fail if we don't have phone.
      // BETTER: Update the hook to expect `phone` or logic to get it.
      // BUT user code is fixed. I will make this hook "smart" enough or change the service to accept ID.

      // Hack: We can't easily change the service to find phone without DB.
      // We'll assume for this turn that we pass `phone` in the mutation object too or `conversation` object.
      // User code: `sendMessage.mutateAsync({ conversationId: conversation.id, content: messageText });`
      // This means the user expects the hook to handle resolution.
      // I'll make the service accept `conversationId` if possible or just cheat and use `phone` from context in the component?
      // No, hook should do it.

      // Okay, I will modify `useSendMessage` to take `{ phone: string, content: string }` and I will UPDATE ChatWindow to pass phone.
      // This is a minimal change to "User Code" that fixes logic. (User code passes ID).
      // OR I can use `queryClient` to find the phone from `whatsapp-conversations`.
      const convs = queryClient.getQueryData<WhatsAppConversation[]>(['whatsapp-conversations']);
      const conv = convs?.find((c) => c.id === data.conversationId);
      if (conv) {
        return whatsappApi.sendMessage({ phone: conv.customerPhone, content: data.content });
      }
      throw new Error('Conversation not found in cache');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: whatsappApi.markAsRead,
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    },
  });
}

export function useContactDetails(contactId: string) {
  return useQuery({
    queryKey: ['whatsapp-contact', contactId],
    queryFn: () => whatsappApi.getContactDetails(contactId),
    enabled: !!contactId,
  });
}

export function useWhatsAppTemplates() {
  return useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: whatsappApi.getTemplates,
  });
}

export function useSendTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      conversationId: string;
      templateId: string;
      variables?: Record<string, string>;
    }) => {
      // We need to resolve conversation phone again or update API to accept conv ID + template ID.
      // Simplest: Fetch template content, replace variables, send as message.
      // OR: Backend has template sending endpoint.
      // The user code separates variables. Backend `SendTemplateAsync` exists?
      // Checking `WhatsAppController`: `[HttpPost("send")]` takes `SendWhatsAppMessageDto`.
      // `[HttpGet("templates")]` gets templates.
      // We probably need to resolve the template client-side or add a specific endpoint.
      // Let's assume strict compliance with user desires: "sendTemplate.mutateAsync({...})".
      // I will assume we find the phone from cache (like before) and send the content as text (simple)
      // OR calls a new hypothetical endpoint if required.
      // Given user code passes `variables`, imply dynamic construction.
      // I'll implement logic here to "simulate" or call a generic send.

      // Strategy: Find conversation -> Get Phone. Find Template -> Fill Variables -> Send Message.
      const convs = queryClient.getQueryData<WhatsAppConversation[]>(['whatsapp-conversations']);
      const conv = convs?.find((c) => c.id === data.conversationId);

      const templates = queryClient.getQueryData<any[]>(['whatsapp-templates']);
      const template = templates?.find((t) => t.id === data.templateId);

      if (conv && template) {
        let content = template.content;
        if (data.variables) {
          Object.entries(data.variables).forEach(([key, val]) => {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), val);
          });
        }
        return whatsappApi.sendMessage({ phone: conv.customerPhone, content });
      }
      throw new Error('Missing context for sending template');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    },
  });
}
