import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueApi } from '@/services/api/queue.service';

export interface QueueStats {
    waitingCount: number;
    activeCount: number;
    pausedCount: number;
    avgWaitTimeMinutes: number;
    longestWaitTimeMinutes: number;
    advogadosDisponiveis: number;
    advogadosOcupados: number;
    advogadosAusentes: number;
    criticalInQueue: number;
    highInQueue: number;
    mediumInQueue: number;
    lowInQueue: number;
}

export interface QueueItem {
    conversationId: string;
    customerName: string;
    customerPhone: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    enteredQueueAt: string;
    positionInQueue: number;
    waitTimeMinutes: number;
}

export interface MyAssignment {
    id: string;
    conversationId: string;
    contact: {
        name: string;
        avatarUrl?: string;
        phone: string;
    };
    lastMessage: string;
    lastMessageAt: string;
    hasUnread: boolean;
    slaWarning: boolean;
}

export interface AdvogadoStatus {
    advogadoId: string;
    name: string;
    status: 'Disponivel' | 'Ocupado' | 'Ausente' | 'Pausa' | 'Offline';
    currentLoad: number;
    maxLoad: number;
    completedToday: number;
    avgResponseTimeMinutes: number;
}

// Queue Stats Hook
export function useQueueStats() {
    return useQuery({
        queryKey: ['queue', 'stats'],
        queryFn: queueApi.getStats,
        refetchInterval: 10000, // Auto-refresh every 10 seconds
    });
}

// Queue Items Hook
export function useQueueItems() {
    return useQuery({
        queryKey: ['queue', 'items'],
        queryFn: () => queueApi.getItems(50),
        refetchInterval: 10000,
    });
}

// My Assignments Hook
export function useMyAssignments() {
    return useQuery({
        queryKey: ['queue', 'my-assignments'],
        queryFn: queueApi.getMyAssignments,
        refetchInterval: 5000,
    });
}

// Advogados Status Hook
export function useAdvogadosStatus() {
    return useQuery({
        queryKey: ['queue', 'advogados-status'],
        queryFn: queueApi.getAdvogadosStatus,
        refetchInterval: 30000,
    });
}

// Accept Next Conversation Mutation
export function useAcceptNextConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: queueApi.acceptNext,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queue'] });
        },
    });
}

// Set My Status Mutation
export function useSetMyStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (status: AdvogadoStatus['status']) => queueApi.setStatus(status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queue', 'advogados-status'] });
        },
    });
}

// Transfer Conversation Mutation
export function useTransferConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ conversationId, toAdvogadoId }: { conversationId: string; toAdvogadoId: string }) =>
            queueApi.transfer(conversationId, toAdvogadoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queue'] });
        },
    });
}
