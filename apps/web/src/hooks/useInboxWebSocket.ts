import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wsClient } from '@/services/websocket/client';
import { useAuthStore } from '@/stores/auth';
import toast from 'react-hot-toast';
import type { Message, Conversation } from '@/types/inbox';

interface InboxWebSocketEvents {
  onNewMessage?: (message: Message) => void;
  onMessageRead?: (data: { conversation_id: string; message_ids: string[] }) => void;
  onConversationUpdate?: (conversation: Conversation) => void;
  onTyping?: (data: { conversation_id: string; contact_name: string }) => void;
}

export function useInboxWebSocket(events?: InboxWebSocketEvents) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  /**
   * Handler para nova mensagem
   */
  const handleNewMessage = useCallback(
    (message: Message) => {
      console.log('📨 Nova mensagem recebida:', message);

      // Atualiza cache de mensagens
      queryClient.setQueryData(['messages', message.conversation_id], (old: any) => {
        if (!old) return { data: [message], pagination: { page: 1, total: 1 } };
        return {
          ...old,
          data: [...old.data, message],
        };
      });

      // Atualiza lista de conversas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });

      // Notificação se não for mensagem própria
      if (message.sender_type === 'contact') {
        toast('Nova mensagem recebida', {
          icon: '📨',
        });
      }

      // Callback customizado
      events?.onNewMessage?.(message);
    },
    [queryClient, events]
  );

  /**
   * Handler para mensagem lida
   */
  const handleMessageRead = useCallback(
    (data: { conversation_id: string; message_ids: string[] }) => {
      console.log('✅ Mensagens lidas:', data);

      // Atualiza cache
      queryClient.setQueryData(['messages', data.conversation_id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((msg: Message) =>
            data.message_ids.includes(msg.id) ? { ...msg, is_read: true } : msg
          ),
        };
      });

      events?.onMessageRead?.(data);
    },
    [queryClient, events]
  );

  /**
   * Handler para atualização de conversa
   */
  const handleConversationUpdate = useCallback(
    (conversation: Conversation) => {
      console.log('🔄 Conversa atualizada:', conversation);

      // Atualiza cache
      queryClient.setQueryData(['conversation', conversation.id], conversation);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      events?.onConversationUpdate?.(conversation);
    },
    [queryClient, events]
  );

  /**
   * Handler para indicador de digitação
   */
  const handleTyping = useCallback(
    (data: { conversation_id: string; contact_name: string }) => {
      console.log('⌨️ Digitando:', data);
      events?.onTyping?.(data);
    },
    [events]
  );

  /**
   * Conecta e registra listeners
   */
  useEffect(() => {
    if (!user) return;

    const socket = wsClient.connect();

    // Entra na sala do tenant
    wsClient.joinRoom(`tenant:${user.tenant_id}`);

    // Registra listeners
    socket.on('inbox:new_message', handleNewMessage);
    socket.on('inbox:message_read', handleMessageRead);
    socket.on('inbox:conversation_update', handleConversationUpdate);
    socket.on('inbox:typing', handleTyping);

    return () => {
      // Remove listeners ao desmontar
      socket.off('inbox:new_message', handleNewMessage);
      socket.off('inbox:message_read', handleMessageRead);
      socket.off('inbox:conversation_update', handleConversationUpdate);
      socket.off('inbox:typing', handleTyping);

      // Sai da sala
      wsClient.leaveRoom(`tenant:${user.tenant_id}`);
    };
  }, [user, handleNewMessage, handleMessageRead, handleConversationUpdate, handleTyping]);

  /**
   * Função para enviar evento de digitação
   */
  const emitTyping = useCallback((conversationId: string) => {
    wsClient.emit('inbox:typing', { conversation_id: conversationId });
  }, []);

  /**
   * Função para marcar mensagens como lidas via WebSocket
   */
  const emitMarkAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    wsClient.emit('inbox:mark_read', {
      conversation_id: conversationId,
      message_ids: messageIds,
    });
  }, []);

  return {
    isConnected: wsClient.isConnected(),
    emitTyping,
    emitMarkAsRead,
  };
}
