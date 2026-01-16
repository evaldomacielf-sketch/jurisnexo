import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

/**
 * Singleton WebSocket Client
 */
class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Conecta ao servidor WebSocket
   */
  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = useAuthStore.getState().token;
    const tenantId = useAuthStore.getState().user?.tenant_id;

    this.socket = io(WS_URL, {
      auth: {
        token,
        tenant_id: tenantId,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();

    return this.socket;
  }

  /**
   * Configura handlers de eventos globais
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ WebSocket desconectado:', reason);

      if (reason === 'io server disconnect') {
        // Servidor forçou desconexão (ex: token inválido)
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Máximo de tentativas de reconexão atingido');
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ Erro WebSocket:', error);
    });

    // Evento de autenticação bem-sucedida
    this.socket.on('authenticated', (data) => {
      console.log('✅ Autenticado no WebSocket:', data);
    });

    // Evento de erro de autenticação
    this.socket.on('auth_error', (error) => {
      console.error('❌ Erro de autenticação:', error);
      this.disconnect();
    });
  }

  /**
   * Desconecta do servidor
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Retorna instância do socket
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Entra em uma sala específica
   */
  joinRoom(room: string): void {
    this.socket?.emit('join_room', { room });
  }

  /**
   * Sai de uma sala específica
   */
  leaveRoom(room: string): void {
    this.socket?.emit('leave_room', { room });
  }

  /**
   * Emite evento customizado
   */
  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }

  /**
   * Escuta evento customizado
   */
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  /**
   * Remove listener de evento
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }
}

export const wsClient = new WebSocketClient();
