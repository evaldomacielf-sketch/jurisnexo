'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { wsClient } from '@/services/websocket/client';
import { useAuthStore } from '@/stores/auth';

interface WebSocketContextValue {
  isConnected: boolean;
  socket: ReturnType<typeof wsClient.getSocket>;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  isConnected: false,
  socket: null,
});

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { token, user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      wsClient.disconnect();
      setIsConnected(false);
      return;
    }

    // Conecta ao WebSocket
    const socket = wsClient.connect();

    // Atualiza estado de conexão
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Define estado inicial
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [token, user]);

  return (
    <WebSocketContext.Provider value={{ isConnected, socket: wsClient.getSocket() }}>
      {children}
    </WebSocketContext.Provider>
  );
}
