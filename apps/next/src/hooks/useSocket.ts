import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getCookie } from 'cookies-next';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket only once
        if (!socketRef.current) {
            const token = getCookie('token'); // Assuming we store JWT here

            // Adjust URL based on environment
            const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            socketRef.current = io(socketUrl, {
                query: { token },
                transports: ['websocket'],
                autoConnect: true,
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
            });

            socketRef.current.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const joinConversation = (conversationId: string) => {
        socketRef.current?.emit('joinConversation', conversationId);
    };

    const leaveConversation = (conversationId: string) => {
        socketRef.current?.emit('leaveConversation', conversationId);
    };

    const sendTyping = (conversationId: string, isTyping: boolean) => {
        socketRef.current?.emit('typing', { conversationId, isTyping });
    };

    return {
        socket: socketRef.current,
        isConnected,
        joinConversation,
        leaveConversation,
        sendTyping,
    };
};
