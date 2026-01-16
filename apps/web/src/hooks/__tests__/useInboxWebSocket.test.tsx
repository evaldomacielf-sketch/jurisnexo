import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInboxWebSocket } from '../useInboxWebSocket';
import { wsClient } from '@/services/websocket/client';
import { useAuthStore } from '@/stores/auth';

// Helper to ensure mock socket is available
const mockSocketObject = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connected: true,
};

// Mock do WebSocket
vi.mock('@/services/websocket/client', () => ({
  wsClient: {
    connect: vi.fn(() => mockSocketObject),
    joinRoom: vi.fn(),
    leaveRoom: vi.fn(),
    emit: vi.fn(),
    isConnected: vi.fn(() => true),
    getSocket: vi.fn(() => mockSocketObject),
  },
}));

// Mock do Auth Store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      id: 'user-1',
      tenant_id: 'tenant-1',
      email: 'test@test.com',
      name: 'Test User',
      role: 'lawyer',
      is_email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    token: 'test-token',
  })),
}));

describe('useInboxWebSocket', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
  );

  it('deve conectar ao WebSocket quando montado', () => {
    renderHook(() => useInboxWebSocket(), { wrapper });

    expect(wsClient.connect).toHaveBeenCalled();
    expect(wsClient.joinRoom).toHaveBeenCalledWith('tenant:tenant-1');
  });

  it('deve desconectar ao desmontar', () => {
    const { unmount } = renderHook(() => useInboxWebSocket(), { wrapper });

    unmount();

    expect(wsClient.leaveRoom).toHaveBeenCalledWith('tenant:tenant-1');
  });

  it('deve retornar status de conexão', () => {
    const { result } = renderHook(() => useInboxWebSocket(), { wrapper });

    expect(result.current.isConnected).toBe(true);
  });

  it('deve permitir emitir evento de digitação', () => {
    const { result } = renderHook(() => useInboxWebSocket(), { wrapper });

    result.current.emitTyping('conversation-1');

    expect(wsClient.emit).toHaveBeenCalledWith('inbox:typing', {
      conversation_id: 'conversation-1',
    });
  });

  it('deve chamar callback onNewMessage quando receber mensagem', async () => {
    const onNewMessage = vi.fn();
    const mockSocket = wsClient.getSocket();

    renderHook(() => useInboxWebSocket({ onNewMessage }), { wrapper });

    // Simula recebimento de mensagem
    const messageHandler = vi
      .mocked(mockSocket?.on)
      .mock.calls.find((call) => call[0] === 'inbox:new_message')?.[1];

    const testMessage = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      content: 'Test message',
      sender_type: 'contact' as const,
      sender_id: 'contact-1',
      message_type: 'text' as const,
      is_read: false,
      sent_at: new Date().toISOString(),
    };

    if (messageHandler) {
      messageHandler(testMessage);
    }

    await waitFor(() => {
      expect(onNewMessage).toHaveBeenCalledWith(testMessage);
    });
  });
});
